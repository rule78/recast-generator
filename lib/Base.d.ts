import { DefinitionsInstType } from './types/base';
export default class Base {
    importType: Array<string>;
    serviceParams: Array<any>;
    constructor();
    getImportDefaultDeclaration(name: string, dir: string): import("ast-types").namedTypes.ImportDeclaration;
    getImportDeclaration(name: string, dir: string): import("ast-types").namedTypes.ImportDeclaration;
    getObjectExpression(propList: Array<string>): import("ast-types").namedTypes.Property[];
    getTemplateLiteral(api: string, pathParams: Array<{
        name: string;
    }>): import("ast-types").namedTypes.TemplateLiteral;
    getTypeAnnotation(i: {
        name: string;
        type: string;
    }): import("ast-types").namedTypes.Identifier;
    getTsEnumDeclaration(i: any): import("ast-types").namedTypes.TSEnumDeclaration;
    getReferenceTSType(name: string): import("ast-types").namedTypes.TSTypeReference;
    getTSType(data: DefinitionsInstType, propKey: string): import("ast-types").namedTypes.TSTypeReference;
    getInterfaceDeclaration(i: DefinitionsInstType): import("ast-types").namedTypes.TSInterfaceDeclaration;
}
