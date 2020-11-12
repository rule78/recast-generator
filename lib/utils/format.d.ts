import { PathsType, DefinitionsType, SchemaType } from '../types/base';
/**
 * 根据子项key值数组去重
 * @param {Array} arr 传入数组
 * @param {String} key 子项key值
 * @return {Array} 返回新数组
 */
export declare function unique(arr: Array<any>, key: string): any[];
/**
 * 筛选属于该controller的api
 * @param {String} controlName 名称
 * @param {Object} paths swagger docs paths
 * @return {Object} 返回新对象
 */
export declare const filterPaths: (controlName: string, paths: PathsType) => any;
export declare const getFileNameByPaths: (paths: PathsType) => any;
export declare const getExtraDefinitions: (def: DefinitionsType) => any[];
export declare const formatRefName: (ref: string) => string;
export declare const formatSchema: (schema: SchemaType) => string;
