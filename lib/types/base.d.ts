export interface ResType<T> {
  data: T;
  status: 'success' | 'falied';
}

export type MethodsType = 'get' | 'put' | 'delete' | 'post';

export interface ApiInstType {
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

export interface ArraySchema {
  items: { $ref: string },
  type: string
}

export interface ObjectSchema { $ref: string }

export type SchemaType = ArraySchema | ObjectSchema