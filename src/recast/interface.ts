import { parse, prettyPrint } from "recast";
import {
  visit as v,
  builders as t,
} from "ast-types";
import { formatRefName } from '../../utils/format';
import { upperFirstKey } from '../../utils';
import { DefinitionsInstType } from '../../types/base';

const getTsEnumDeclaration = (i: any) => {
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

const getReferenceTSType = (name: string) => {
  return t.tsTypeReference(t.identifier(name))
}
const getTSType = (data: DefinitionsInstType, propKey: string) => {
  const { name, properties } = data;
  const item = properties[propKey]
  const baseType = ['boolean', 'string', 'number', 'integer']
  // enum类型引用
  if (item.enum) {
    return getReferenceTSType(`${name}${upperFirstKey(propKey)}`);
  }
  if (baseType.includes(item.type)) {
    return getReferenceTSType(item.type);
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
  return getReferenceTSType(formatRefName(item.$ref));
}

const getInterfaceDeclaration = (i: DefinitionsInstType) => {
  const props = i.properties;
  const InterfaceBody = Object.keys(props).map(key => {
    return t.tsPropertySignature(
      t.identifier(key),
      t.tsTypeAnnotation(getTSType(i, key)),
      i.required ? !i.required.includes(key): false,
    )
  })
  return t.tsInterfaceDeclaration(
    t.identifier(i.name),
    t.tsInterfaceBody(InterfaceBody),
  )
}

const generator = (source: string, defList: any[]) => {
  const ast = parse(source);
  v(ast, {
    visitProgram(path) {
      defList.map((i: DefinitionsInstType) => {
        if (i.type === 'object') {
          path.get("body").push(
            t.exportNamedDeclaration(
              getInterfaceDeclaration(i)
            )
          )
        } else {
          path.get("body").push(getTsEnumDeclaration(i));
        }
      })
      this.traverse(path);
    }
  })
  return prettyPrint(ast, { tabWidth: 2 }).code;
}

export default generator;