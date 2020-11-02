interface ResInst<T> {
  data: T;
  status: 'success' | 'falied';
}

type MethodsType = 'get' | 'put' | 'delete' | 'post';

interface ApiInstType {
  tags: Array<any>;
  summary: string;
  responses: any;
  parameters: any;
  operationId: string;
}

export type ApiType = {
  [propName in MethodsType]: ApiInstType;
};

export type DefinitionsInstType = {
  properties: any;
  type: string;
  required: string[];
  name: string;
}

export interface DefinitionsType {
  [propName: string]: DefinitionsInstType;
}

export interface PathsType {
  [propName: string]: ApiType;
}

export interface SwaggerDocType {
  tags: any;
  paths: PathsType;
  definitions: DefinitionsType;
}