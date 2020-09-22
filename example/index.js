import * as baby from 'babylon';
import traverse from "@babel/traverse";
import generate from "@babel/generator";
import * as t from "@babel/types";
const fs = require('fs');
const path = require('path');

const dir = path.join("./memu.js");
const source = fs.readFileSync(dir, "utf8");
const ast = baby.parse(source, {
  sourceType: "module",
});

traverse(ast, {
  enter(path) {
    if(t.isIdentifier(path.node, { name: "b" })){
      path.parentPath.insertAfter(
        t.objectProperty(t.identifier('c'), t.numericLiteral(3))
      )
    }
  }
});
const { code } = generate(ast);

fs.access(dir, (err)=>{
  if (!err) {
    fs.unlink(dir, function(err) {
      if(err){
          console.log(err);
          return ;
      }
      fs.writeFile(dir, code, function(err) {
        if(err) {
          return console.log(err);
        }
        console.log('成功写入!');
      });
    });
  }
});
