import * as baby from 'babylon';
import * as t from "@babel/types";
import traverse from "@babel/traverse";
import generate from "@babel/generator";
import { changeFile, formatPaths } from '../utils';

const fs = require('fs');
const path = require('path');

const dir = path.join("./memu.js");
const source = fs.readFileSync(dir, "utf8");
const ast = baby.parse(source, {
  sourceType: "module",
});

// 生成导入节点
const getImportDeclaration = () => {
  return t.importDeclaration(
    [t.ImportDefaultSpecifier(t.identifier('request'))],
    t.stringLiteral('@/utils/request')
  );
}

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
// 生成显式函数request声明
const getFunctionDeclaration = (config) => {
  const { 
    method = "get",
    name: exportName,
    api = '/api/',
    hasQueryParam, // query请求参数
    hasBodyParam, // body请求参数
  } = config;
  const funcParams = [] // 声明函数传参
  const methodProps = [] // method参数数组
  // 参数顺序 path、query、body
  if (hasQueryParam) {
    funcParams.push(t.identifier('data'))
    methodProps.push('data')
  }
  if (hasBodyParam) {
    funcParams.push(t.identifier('params'))
    methodProps.push('params')
  }
  return t.functionDeclaration(
    t.identifier(exportName),
    funcParams, // func参数
    t.blockStatement(
      [t.returnStatement(
        t.callExpression( // 方法调用
          t.MemberExpression(
            t.identifier('request'),
            t.identifier(method),
          ),
          [
            t.stringLiteral(api), 
            t.objectExpression( // method参数数组
              getObjectExpression(methodProps)
            )
          ]
        )
      )]
    ),
    false,
    true,
  )
}

const paths = {
  '/mgmt/advanceSellProduct': {
    get: {
      parameters: [{
        description: "status",
        format: "int32",
        in: "query",
        name: "status",
        required: false,
        type: "integer",
      }, {
        description: "skuCode",
        format: "int64",
        in: "query",
        name: "skuCode",
        required: false,
        type: "integer",
      }],
      summary: "预售商品查找接口",
      responses: {
        200: {
          description: "OK"
        }
      }
    },
    post: {
      parameters: [{
        description: "advanceSellProductVo",
        in: "body",
        name: "advanceSellProductVo",
        required: true,
      }, {
        default: true,
        description: "validate",
        in: "query",
        name: "validate",
        required: false,
        type: "boolean",
      }],
      summary: "预售商品创建接口",
      responses: {
        200: {
          description: "OK"
        }
      }
    }
  },
}

// test
traverse(ast, {
  Program(path) {
    // 是否有request引入
    const imporNode = path.node.body.find(i=> i.type === 'ImportDeclaration')
    if (!imporNode) {
      path.unshiftContainer("body", getImportDeclaration());
    }
    formatPaths(paths).forEach(i => {
      // if (i.summary) {
      //   path.pushContainer('body',
      //   t.expressionStatement(
      //     t.stringLiteral(`// ${i.summary}`))); 
      // }
      path.pushContainer("body",
        t.exportNamedDeclaration(
          getFunctionDeclaration(i)
        )
      );
    })
  },
});

const { code } = generate(ast, { jsonCompatibleStrings: true});
changeFile(dir, code);
