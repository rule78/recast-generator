import { parse, prettyPrint } from "recast";
import {
  visit as v,
  builders as t,
} from "ast-types";
import { formatPaths } from './utils';
import { formatSchema, formatRefName } from './utils/format';
import {
  ResCode,
} from './types/base';

// Important构建器：生成默认导入节点
const getImportDefaultDeclaration = (name: string, dir: string) => {
  return t.importDeclaration(
    [t.importDefaultSpecifier(t.identifier(name))],
    t.literal(dir)
  );
}
// Important构建器：生成析构导入节点
const getImportDeclaration  = (name: string, dir: string) => {
  return t.importDeclaration(
    [t.importSpecifier(t.identifier(name), t.identifier(name))],
    t.literal(dir)
  );
}

// ParameterInstantiation：泛型参数
const getParameterInstantiation = (res: any) => {
  if (res[ResCode.success]?.schema?.$ref) {
    return t.tsTypeParameterInstantiation( //泛型
      [t.tsTypeReference(
        t.identifier(
          formatRefName(res[ResCode.success].schema.$ref)
        ),
      )]
    )
  }
  return t.tsTypeParameterInstantiation( //泛型
    [t.tsTypeReference(
      t.identifier('{}'),
    )]
  )
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

const getTypeAnnotation = (i: { name: string; type: string; }) => {
  // url参数取name，body参数取data,query参数取params
  let arg = t.identifier(i.name);
  // 缺少ref类型转化
  arg.typeAnnotation = t.typeAnnotation(
    t.genericTypeAnnotation(
      t.identifier(i.type === 'integer' ? 'number': i.type),
      null // params
    ),
  );
  return arg;
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
    responses, // 接口返回对象
  } = config;
  const funcParams = [] // 声明函数传参
  const methodProps = [] // method参数数组
  let apiNode = null;
  // 参数顺序 path、query、body、formData
  if (pathParams.length > 0) {
    pathParams.map(i => {
      funcParams.push(getTypeAnnotation(i));
    })
    apiNode = getTemplateLiteral(api, pathParams);
  } else {
    apiNode = t.stringLiteral(api);
  }
  // url参数
  if (queryParams.length > 0) {
    funcParams.push(
      t.identifier('params')
    )
    methodProps.push('params')
  }
  // 请求主体被发送的数据
  if (bodyParams.length > 0) {
    funcParams.push(
      getTypeAnnotation({
        name: 'data',
        type: formatSchema(bodyParams[0].schema)
      })
    )
    methodProps.push('data')
  }
  let funcParamsNode = [apiNode];
  if (queryParams.length > 0 || bodyParams.length > 0) {
    funcParamsNode.push(
      t.objectExpression( // method参数数组
        getObjectExpression(methodProps)
      )
    )
  }
  let declaration = t.functionDeclaration(
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
    true,  // generator
  )
  declaration.returnType = t.tsTypeAnnotation(
    t.tsTypeReference(
      t.identifier('ResType'),
      getParameterInstantiation(responses)
    )
  )
  return declaration;
}


/**
 * service generator
 * @param {String} source 原代码
 * @param {Object} paths swagger docs paths
 * @return {String} 返回新代码
 */
const generator = (source: string, paths: any): string => {
  const ast = parse(source);
  v(ast, {
    visitProgram(path) {
      // request import
      const imporNode = path.node.body.find(i => i.type === 'ImportDeclaration')
      if (!imporNode) {
        path.get("body").unshift(getImportDefaultDeclaration('request', '@/utils/request'));
        path.get("body").unshift(getImportDeclaration('ResType', '@/types'));
      }
      formatPaths(paths).forEach((i, index) => {
        const sameExportNode = path.node.body.find((e: any) => {
          if (e.type === 'ExportNamedDeclaration' && e.declaration.id) {
            return e.declaration.id.name === i.name;
          }
          return false;
        })
        if (!sameExportNode) { // 不存在该方法声明时
          path.get("body").push(
            t.exportNamedDeclaration(
              getFunctionDeclaration(i)
            ))
          // 通过方法index映射注释
          const funcNodeList = path.node.body.filter((i: any) => i.declaration);
          funcNodeList[index].comments = [t.commentLine(i.summary)];
        }
        return;
      })
      this.traverse(path);
    }
  })
  return prettyPrint(ast, { tabWidth: 2 }).code;
}

export default generator;