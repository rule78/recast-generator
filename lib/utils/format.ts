import { 
  PathsType,
  DefinitionsType,
  SchemaType,
  ObjectSchema,
  ArraySchema,
} from '../types/base';

// 首字母大写
const upperFirstKey = (name: string): string => {
  return name.charAt(0).toUpperCase() + name.slice(1);
}

/**
 * 根据子项key值数组去重
 * @param {Array} arr 传入数组
 * @param {String} key 子项key值
 * @return {Array} 返回新数组
 */
export function unique(arr: Array<any>, key: string) {
  const res = new Map();
  return arr.filter(a => !res.has(a[key]) && res.set(a[key], 1));
}

/**
 * 筛选属于该controller的api
 * @param {String} controlName 名称
 * @param {Object} paths swagger docs paths
 * @return {Object} 返回新对象
 */
export const filterPaths = (controlName: string, paths: PathsType) => {
  const target: any = {};
  Object.keys(paths).forEach((i) => {
    const path = paths[i]
    const methodList = Object.values(path);
    for(let m=0; m < methodList.length; m++){
      if(methodList[m] && methodList[m].tags.includes(controlName)){
        target[i] = paths[i];
        return;
      }
    }
  })
  return target;
}

// 根据paths关键字权重获取合适的文件名
export const getFileNameByPaths = (paths: PathsType) => {
  const keys = Object.keys(paths).map(i=>{
    const pathSplit = i.split('/');
    return pathSplit[2];
  })
  let maxEle;
  let maxNum=1;
  keys.reduce(function (p,k) {
    p[k] ? p[k]++ : p[k]=1;
    if(p[k] > maxNum){
        maxEle = k;
        maxNum++;
    }
    return p;
  },{});
  return maxEle;
}

// 获取额外值声明
export const getExtraDefinitions = (def: DefinitionsType) => {
  const target: Array<any> = [];
  // object name
  Object.keys(def).forEach(key => {
    const props = def[key].properties;
    // prop name
    Object.keys(props).forEach(i => {
      if (props[i].type === 'integer') {
        props[i].type = 'number';
      }
      if (props[i].enum) {
        target.push({
          name: `${key}${upperFirstKey(i)}`,
          type: 'enum',
          values: props[i].enum,
          enumType: props[i].type,
        })
      }
    })
    // 简单定义基础类型名称
    target.push(Object.assign(def[key], {name : key}));
  })
  return target;
}

// 格式化ref接口名称
export const formatRefName = (ref: string) => {
  //ref '#/definitions/Category'
  const nameSplit = ref.split('/');
  return nameSplit[2];
}

// 获取schema引用的类型
export const formatSchema = (schema: SchemaType) => {
  if ((<ArraySchema>schema).type === 'array') {
    const params = formatRefName((<ArraySchema>schema).items.$ref);
    return `Array<${params}>`;
  }
  return formatRefName((<ObjectSchema>schema).$ref);
}