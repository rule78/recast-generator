import { parse, prettyPrint } from "recast";
import {
  visit as v,
  namedTypes as n,
  builders as t,
} from "ast-types";
import { formatRefName } from '../utils/format';

const getTsEnumDeclaration = (i) => {
  return t.tsEnumDeclaration(
    t.identifier(i.name),
    i.values.map((m) => t.tsEnumMember(
      t.identifier(m),
    )),
  )
}

const getInterfaceDeclaration = (i) => {
  return t.tsInterfaceDeclaration(
    t.identifier(i.name),
    null, // typeParameters
    null, // extends
    t.tsInterfaceBody(

    ),
    true, // declare
  )
}

const generator = (source, def) => {
  const ast = parse(source, {
    sourceType: "module",
    plugins: ["flowComments", "typescript"]
  });
  v(ast, {
    visitProgram(path) {
      def.map(i => {
        if (i.type === 'object') {
          path.get("body").push(getInterfaceDeclaration(i));
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