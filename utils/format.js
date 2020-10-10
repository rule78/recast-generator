/**
 * 根据子项key值数组去重
 * @param {Array} arr 传入数组
 * @param {String} key 子项key值
 * @return {Array} 返回新数组
 */
export function unique(arr, key) {
  const res = new Map();
  return arr.filter(a => !res.has(a[key]) && res.set(a[key], 1));
}

/**
 * 筛选属于该control的api
 * @param {String} controlName 名称
 * @param {Object} paths swagger docs paths
 * @return {Object} 返回新对象
 */
export const filterPaths = (controlName, paths) => {
  const target = {};
  Object.keys(paths).forEach((i) => {
    const path = paths[i]
    const methodList = Object.values(path);
    for(let m=0; m<methodList.length; m++){
      if(methodList[m].tags.includes(controlName)){
        target[i] = paths[i];
        return;
      }
    }
  })
  return target;
}

// 根据psths关键字权重获取合适的文件名
export const getFileNameByPaths = (paths) => {
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