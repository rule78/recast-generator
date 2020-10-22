import { parse, print } from "recast";
import assert from "assert";
import {
  visit as v,
  namedTypes as n,
  builders as t,
} from "ast-types";
import { changeFile, formatPaths } from '../utils';

const fs = require('fs');
const path = require('path');

const paths = {
    '/mgmt/advanceSellProduct/stop/{id}': {
        put: {
          parameters: [{
            description: "id",
            format: "int32",
            in: "path",
            name: "id",
            required: false,
            type: "integer",
          }, {
            description: "skuCode",
            format: "int64",
            in: "body",
            name: "skuCode",
            required: false,
            type: "integer",
          }],
          summary: "添加预售商品接口",
          responses: {
            200: {
              description: "OK"
            }
          }
        },
      },
  }

const dir = path.join("./memu.js");
const source = fs.readFileSync(dir, "utf8");
const ast = parse(source, {
  sourceType: "module",
});

// Important构建器：生成request导入节点
const getImportDeclaration = () => {
    return t.importDeclaration(
      [t.importDefaultSpecifier(t.identifier('request'))],
      t.literal('@/utils/request')
    );
  }

// Object构建器：生成axios请求参数节点
const getObjectExpression = (propList) => {
    const target = propList.map(i=>{
      return t.objectProperty(
        t.identifier(i),
        t.identifier(i),
        false,
        true
      )
    })
    return target;
  }
  
  // stringTpl构建器：生成字符串模板节点
  const getTemplateLiteral = (api, pathParams) => {
    const qList = api.split(/{|}/);
    const expressions = pathParams.map((i)=>{
      return t.identifier(i.name);
    })
    const quasis = qList.filter(i=>!pathParams.map(i=>i.name).includes(i)).map((i)=>{
        return t.templateElement({ raw: i, cooked: i }, true);
    })
    return t.templateLiteral(quasis, expressions);
  }
  
// func构建器：生成request函数声明
const getFunctionDeclaration = (config) => {
    const { 
      method = "get",
      name: exportName,
      api = '/api/',
      hasQueryParam, // query请求参数
      hasBodyParam, // body请求参数
      pathParams, // path请求参数
    } = config;
    const funcParams = [] // 声明函数传参
    const methodProps = [] // method参数数组
    let apiNode = null;
    // 参数顺序 path、query、body
    if (pathParams.length > 0){
      pathParams.map(i=> {
        funcParams.push(t.identifier(i.name))
      })
      apiNode = getTemplateLiteral(api, pathParams);
    } else {
      apiNode = t.stringLiteral(api);
    }
    if (hasQueryParam) {
      funcParams.push(t.identifier('data'))
      methodProps.push('data')
    }
    if (hasBodyParam) {
      funcParams.push(t.identifier('params'))
      methodProps.push('params')
    }
    let funcParamsNode = [apiNode];
    if (hasQueryParam || hasBodyParam) {
      funcParamsNode.push(
        t.objectExpression( // method参数数组
          getObjectExpression(methodProps)
        )
      )
    }
    return t.functionDeclaration(
      t.identifier(exportName),
      funcParams, // func参数
      t.blockStatement(
        [t.returnStatement(
          t.callExpression( // 方法调用
            t.memberExpression(
              t.identifier('request'),
              t.identifier(method),
            ),
            funcParamsNode,
          )
        )]
      ),
      true,
      false,
    )
  }

v(ast, {
    visitProgram(path) {
        const imporNode = path.node.body.find(i => i.type === 'ImportDeclaration')
        if (!imporNode) { 
          path.get("body").unshift(getImportDeclaration());
        }
        formatPaths(paths).forEach((i, index) => {
            path.get("body").push(
              t.exportNamedDeclaration(
                getFunctionDeclaration(i)
              ))
            const funcNodeList = path.node.body.filter(i => i.declaration)
            funcNodeList[index].comments = [t.commentLine(i.summary)]
          })
        this.traverse(path);
    }
})

console.log(print(ast).code);