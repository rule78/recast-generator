import { parse, prettyPrint } from "recast";
import {
  visit as v,
  builders as t,
} from "ast-types";
import Base from './Base';
import { formatPaths } from './utils';
import { formatSchema, formatRefName } from './utils/format';
import {
  ResCode,
} from './types/base';

export default class BuildService extends Base {
  constructor() {
    super();
  }
  // ParameterInstantiation：泛型参数
  getParameterInstantiation(res: any) {
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

  // func构建器：生成request函数声明
  getFunctionDeclaration = (config) => {
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
        funcParams.push(super.getTypeAnnotation(i));
      })
      apiNode = super.getTemplateLiteral(api, pathParams);
    } else {
      apiNode = t.stringLiteral(api);
    }
    // url参数
    if (queryParams.length > 0) {
      const exportTpye = `${exportName}Params`
      funcParams.push(
        super.getTypeAnnotation({
          name: 'params',
          type: exportTpye
        })
      )
      // 添加query参数类型声明
      this.serviceParams.push({
        name: exportTpye,
        params: queryParams
      });
      methodProps.push('params')
    }
    // 请求主体被发送的数据
    if (bodyParams.length > 0) {
      funcParams.push(
        super.getTypeAnnotation({
          name: 'data',
          type: formatSchema(bodyParams[0].schema)
        })
      )
      methodProps.push('data')
    }
    const funcParamsNode: any = [apiNode];
    if (queryParams.length > 0 || bodyParams.length > 0) {
      funcParamsNode.push(
        t.objectExpression( // method参数数组
          super.getObjectExpression(methodProps)
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
        this.getParameterInstantiation(responses)
      )
    )
    return declaration;
  }

  addImportNode(path) {
    // request import
    const imporNode = path.node.body.find(i => i.type === 'ImportDeclaration')
    if (!imporNode) {
      path.get("body").unshift(
        super.getImportDefaultDeclaration('request', '@/utils/request')
      );
      path.get("body").unshift(super.getImportDeclaration('ResType', '@/types'));
    }
  }
  addExportNode(paths, path) {
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
            this.getFunctionDeclaration(i)
          ))
        // 通过方法index映射注释
        const funcNodeList = path.node.body.filter((i: any) => i.declaration);
        funcNodeList[index].comments = [t.commentLine(i.summary)];
      }
      return;
    })
  }
  addParamsTypeAnnotation() {
    // console.log(this.serviceParams, 'serviceParamsDeclaration');
  }
  generator(source: string, paths: any): string {
    const ast = parse(source);
    const _this = this;
    v(ast, {
      visitProgram(path) {
        _this.addImportNode(path);
        _this.addExportNode(paths, path);
        _this.addParamsTypeAnnotation()
        this.traverse(path);
      }
    })
    return prettyPrint(ast, { tabWidth: 2 }).code;
  }
}