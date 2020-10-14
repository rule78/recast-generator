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
  plugins: ["flowComments"]
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

// 获取字符串模板节点
const getTemplateLiteral = (api, pathParams) => {
  const qList = api.split(/{|}/);
  const expressions = pathParams.map((i)=>{
    return t.identifier(i.name);
  })
  const quasis = qList.filter(i=>!pathParams.map(i=>i.name).includes(i))
  .map((i)=>{
    return t.templateElement({ raw: i, cooked: i });
  })
  return t.templateLiteral(quasis, expressions);
}

// 生成显式函数request声明
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
          t.MemberExpression(
            t.identifier('request'),
            t.identifier(method),
          ),
          funcParamsNode,
        )
      )]
    ),
    false,
    true,
  )
}

const generator = (paths) => {
  traverse(ast, {
    Program(path) {
      // 是否有request引入
      const imporNode = path.node.body.find(i => i.type === 'ImportDeclaration')
      if (!imporNode) {
        path.unshiftContainer("body", getImportDeclaration());
      }
      formatPaths(paths).forEach(i => {
        path.pushContainer("body",
          t.exportNamedDeclaration(
            getFunctionDeclaration(i)
          )
        );
      })
    },
  });

  const { code } = generate(ast);
  changeFile(dir, code);
}

export default generator;