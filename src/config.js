import * as baby from 'babylon';
import * as t from "@babel/types";
import traverse from "@babel/traverse";
import generate from "@babel/generator";
import { changeFile } from '../utils';

const fs = require('fs');
const path = require('path');

const value = 888;
const key = "c";
const bhindKey = "b";

const dir = path.join("./memu.js");
const source = fs.readFileSync(dir, "utf8");
const ast = baby.parse(source, {
  sourceType: "module",
}); 

// 更新属性visitor
const updateVisitor = {
  Property(pPath) {
    if (this.hasSameKey && t.isIdentifier(pPath.node.key, { name: key })) {
      pPath.replaceWith(
        t.objectProperty(t.identifier(key), t.numericLiteral(value))
      )
      pPath.stop();
    }
    if (!this.hasSameKey && t.isIdentifier(pPath.node.key, { name: bhindKey })) {
      pPath.insertAfter(
        t.objectProperty(t.identifier(key), t.numericLiteral(value))
      )
      pPath.stop();
    }
  }
};

// test
traverse(ast, {
  ObjectExpression(path) {
    // 同属性覆盖处理
    if(path.parentPath.node.id.name === 'config'){
      const hasSameKey = path.node.properties.find(i => i.key.name === key)
      path.traverse(updateVisitor, { hasSameKey });
    }
  }
});

const { code } = generate(ast);
changeFile(dir, code);
