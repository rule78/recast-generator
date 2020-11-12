import Base from './Base';
export default class BuildService extends Base {
    constructor();
    addExportNamedDeclaration(i: any): import("ast-types").namedTypes.ExportNamedDeclaration;
    addTsEnumDeclaration(i: any): import("ast-types").namedTypes.TSEnumDeclaration;
    generator: (source: string, defList: any[]) => string;
}
