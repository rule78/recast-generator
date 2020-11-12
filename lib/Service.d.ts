import Base from './Base';
export default class BuildService extends Base {
    constructor();
    getParameterInstantiation(res: any): import("ast-types").namedTypes.TSTypeParameterInstantiation;
    getFunctionDeclaration: (config: any) => import("ast-types").namedTypes.FunctionDeclaration;
    addImportNode(path: any): void;
    addExportNode(paths: any, path: any): void;
    addParamsTypeAnnotation(): void;
    generator(source: string, paths: any): string;
}
