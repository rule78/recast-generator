import { parse, prettyPrint } from "recast";
import {
  visit as v,
  builders as t,
} from "ast-types";
import Base from './Base';
import { DefinitionsInstType } from './types/base';

export default class BuildInterface extends Base {
  constructor() {
    super();
  }
  addExportNamedDeclaration(i) {
   return t.exportNamedDeclaration(
      super.getInterfaceDeclaration(i)
    )
  }
  addTsEnumDeclaration(i) {
    return super.getTsEnumDeclaration(i)
   }
  generator = (source: string, defList: any[]) => {
    const ast = parse(source);
    const _this = this;
    v(ast, {
      visitProgram(path) {
        defList.map((i: DefinitionsInstType) => {
          if (i.type === 'object') {
            path.get("body").push(_this.addExportNamedDeclaration(i))
          } else {
            path.get("body").push(_this.addTsEnumDeclaration(i));
          }
        })
        this.traverse(path);
      }
    })
    return prettyPrint(ast, { tabWidth: 2 }).code;
  }
}
