import {
  builders as t,
} from "ast-types";
import { formatRefName } from './utils/format';
import { upperFirstKey } from './utils';
import { DefinitionsInstType } from './types/base';

export default class Base{
  importType: Array<string>;
  serviceParams: Array<{name: string, params: any}>;

  constructor() {
    this.importType = [];
    this.serviceParams = [];
  }
  // Important构建器：生成默认导入节点
  public getImportDefaultDeclaration (name: string, dir: string) {
    return t.importDeclaration(
      [t.importDefaultSpecifier(t.identifier(name))],
      t.literal(dir)
    );
  }
  // Important构建器：生成析构导入节点
  public getImportDeclaration (list: string[], dir: string) {
    const importSpecifier = list.map(name=> {
      return t.importSpecifier(t.identifier(name), t.identifier(name))
    })
    return t.importDeclaration(
      importSpecifier,
      t.literal(dir)
    );
  }
  // Object构建器：生成请求参数节点
  public getObjectExpression (propList: Array<string>) {
    const target = propList.map(i => {
      return t.property('init', t.identifier(i), t.identifier(i));
    })
    return target;
  }
  // stringTpl构建器：生成字符串模板节点
  public getTemplateLiteral (api: string, pathParams: Array<{name: string}>) {
    const qList = api.split(/{|}/);
    const expressions = pathParams.map((i) => {
      return t.identifier(i.name);
    })
    const quasis = qList.filter(i => !pathParams.map(i => i.name).includes(i)).map((i) => {
      return t.templateElement({ raw: i, cooked: i }, true);
    })
    return t.templateLiteral(quasis, expressions);
  }
  // 
  public getTypeAnnotation (i: { name: string; type: string; }) {
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
  // Aliases: Statement, Declaration
  public getTsEnumDeclaration (i: { enumType: string; name: string; values: any[]; }) {
    // numericLiteral
    const getInitializer = (value: string) => {
      return i.enumType === 'string' ? t.stringLiteral(value): null;
    }
    return t.tsEnumDeclaration(
      t.identifier(i.name),
      i.values.map((m: any) => t.tsEnumMember(
        t.identifier(m),
        getInitializer(m),
      )),
    )
  }
  // Aliases: TSType
  public getReferenceTSType (name: string) {
    return t.tsTypeReference(t.identifier(name))
  }
  // Aliases: TSType
  public getTSType (data: DefinitionsInstType, propKey: string) {
    const { name, properties } = data;
    const item = properties[propKey]
    const baseType = ['boolean', 'string', 'number', 'integer']
    // enum类型引用
    if (item.enum) {
      return this.getReferenceTSType(`${name}${upperFirstKey(propKey)}`);
    }
    if (baseType.includes(item.type)) {
      return this.getReferenceTSType(item.type);
    }
    if (item.type === 'array') {
      // 数组类型 仅可接受一类型参数
      const parameterName = item.items.type ||
        formatRefName(item.items.$ref);
      return t.tsTypeReference(
        t.identifier('Array'),
        t.tsTypeParameterInstantiation( //泛型
          [t.tsTypeReference(
            t.identifier(parameterName),
          )]
        )
      )
    }
    return this.getReferenceTSType(formatRefName(item.$ref));
  }

  //Aliases: Statement, Declaration
  public getInterfaceDeclaration (i: DefinitionsInstType) {
    const props = i.properties;
    const InterfaceBody = Object.keys(props).map(key => {
      return t.tsPropertySignature(
        t.identifier(key),
        t.tsTypeAnnotation(this.getTSType(i, key)),
        i.required ? !i.required.includes(key): false,
      )
    })
    return t.tsInterfaceDeclaration(
      t.identifier(i.name),
      t.tsInterfaceBody(InterfaceBody),
    )
  }
}
