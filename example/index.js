import * as baby from 'babylon';
import * as t from "@babel/types";
import traverse from "@babel/traverse";
import generate from "@babel/generator";
import { changeFile } from '../utils';

const fs = require('fs');
const path = require('path');

const value = 999;
const key = "c";
const bhindKey = "b";

const dir = path.join("./memu.js");
const source = fs.readFileSync(dir, "utf8");
const ast = baby.parse(source, {
  sourceType: "module",
}); 

traverse(ast, {
  ObjectExpression(path) {
    // 同属性覆盖处理
    if(path.parentPath.node.id.name === 'config'){
      path.traverse({
        Property(pPath) {
          const hasSameKey = t.isIdentifier(pPath.node.key, { name: key });
          if (hasSameKey) {
            console.log('---');
            pPath.replaceWith(
              t.objectProperty(t.identifier(key), t.numericLiteral(value))
            )
            pPath.stop();
          }
          if (!hasSameKey && t.isIdentifier(pPath.node.key, { name: bhindKey })) {
            console.log(pPath, '111');
            pPath.insertAfter(
              t.objectProperty(t.identifier(key), t.numericLiteral(value))
            )
            pPath.stop();
          }
        }
      });
    }
  }
});

const { code } = generate(ast);
changeFile(dir, code);
