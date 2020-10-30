import { parse, prettyPrint } from "recast";
import {
  visit as v,
  namedTypes as n,
  builders as t,
} from "ast-types";
import { formatPaths } from '../../utils';

// Important构建器：生成request导入节点
const getImportDeclaration = () => {
  return t.importDeclaration(
    [t.importDefaultSpecifier(t.identifier('request'))],
    t.literal('@/utils/request')
  );
}

// Object构建器：生成axios请求参数节点
const getObjectExpression = (propList) => {
  const target = propList.map(i => {
    return t.property('init', t.identifier(i), t.identifier(i));
  })
  return target;
}

// stringTpl构建器：生成字符串模板节点
const getTemplateLiteral = (api, pathParams) => {
  const qList = api.split(/{|}/);
  const expressions = pathParams.map((i) => {
    return t.identifier(i.name);
  })
  const quasis = qList.filter(i => !pathParams.map(i => i.name).includes(i)).map((i) => {
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
    queryParams, // query请求参数
    bodyParams, // body请求参数
    pathParams, // path请求参数
  } = config;
  const funcParams = [] // 声明函数传参
  const methodProps = [] // method参数数组
  let apiNode = null;
  // 参数顺序 path、query、body
  if (pathParams.length > 0) {
    pathParams.map(i => {
      funcParams.push(t.identifier(i.name))
    })
    apiNode = getTemplateLiteral(api, pathParams);
  } else {
    apiNode = t.stringLiteral(api);
  }
  if (queryParams.length > 0) {
    funcParams.push(t.identifier('data'))
    methodProps.push('data')
  }
  if (bodyParams.length > 0) {
    funcParams.push(t.identifier('params'))
    methodProps.push('params')
  }
  let funcParamsNode = [apiNode];
  if (queryParams.length > 0 || bodyParams.length > 0) {
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
      [
        t.variableDeclaration("const", [
          t.variableDeclarator(
            t.identifier('res'),
            t.yieldExpression(
              t.callExpression( // 方法调用
                t.memberExpression(
                  t.identifier('request'),
                  t.identifier(method),
                ),
                funcParamsNode,
              )
            )
          )
        ]),
        t.returnStatement(
          t.identifier('res')
        )]
    ),
    true,
    false,
  )
}


/**
 * service generator
 * @param {String} source 原代码
 * @param {Object} paths swagger docs paths
 * @return {String} 返回新代码
 */
const generator = (source, paths) => {
  const ast = parse(source, {
    sourceType: "module",
    plugins: ["flowComments"]
  });
  v(ast, {
    visitProgram(path) {
      // request import
      const imporNode = path.node.body.find(i => i.type === 'ImportDeclaration')
      if (!imporNode) {
        path.get("body").unshift(getImportDeclaration());
      }
      formatPaths(paths).forEach((i, index) => {
        const sameExportNode = path.node.body.find(e => {
          if (e.type === 'ExportNamedDeclaration' && e.declaration.id) {
            return e.declaration.id.name === i.name
          }
        })
        if (!sameExportNode) { // 不存在该方法声明时
          path.get("body").push(
            t.exportNamedDeclaration(
              getFunctionDeclaration(i)
            ))
          // 添加注释
          const funcNodeList = path.node.body.filter(i => i.declaration)
          funcNodeList[index].comments = [t.commentLine(i.summary)]
        }
        return;
      })
      this.traverse(path);
    }
  })
  return prettyPrint(ast, { tabWidth: 2 }).code;
}

export default generator;