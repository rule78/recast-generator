import * as baby from 'babylon';
import * as t from "@babel/types";
import traverse from "@babel/traverse";
import generate from "@babel/generator";
import { changeFile } from '../utils';

const fs = require('fs');
const path = require('path');

const dir = path.join("./memu.js");
const source = fs.readFileSync(dir, "utf8");
const ast = baby.parse(source, {
  sourceType: "module",
});

// 生成显式函数request声明
const getFunctionDeclaration = (config) => {
  const { method = "get", name: exportName, api = '/api/' } = config;
  return t.functionDeclaration(
    t.identifier(exportName),
    [t.identifier('data')],
    t.blockStatement(
      [t.returnStatement(
        t.callExpression( // 方法调用
          t.MemberExpression(
            t.identifier('request'),
            t.identifier(method),
          ), 
          [t.stringLiteral(api),  // 参数数组
            t.objectExpression(
              [ 
                t.objectProperty(
                  t.identifier('data'),
                  t.identifier('data'),
                  false,
                  true
                )
              ]
            )
          ]
        )
      )]
    ),
    false,
    true,
  )
}

const funcList = [
  {name: 'fetchList', method: 'get'},
  {name: 'addList', method: 'post'}
]

// test
traverse(ast, {
  Program(path) {
    funcList.forEach(i => {
      path.pushContainer("body",
        t.exportNamedDeclaration(
          getFunctionDeclaration(i)
        )
      );
    })
  }
});

const { code } = generate(ast);
changeFile(dir, code);
