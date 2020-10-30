const fs = require('fs');

const changeFile = (dir, code, cd) => {
  fs.access(dir, (err) => {
    if (!err) {
      fs.writeFile(dir, code, function (err) {
        if (err) {
          return console.log(err);
        }
        if (cd) {
          cd();
        } else {
          console.log(`成功写入!${dir}`);
        }
      });
    } else {
      console.log('该文件不存在')
    }
  });
}

const upperFirstKey = (name) => {
  return name.charAt(0).toUpperCase() + name.slice(1);
}
// 映射method对应action
const methodMap = {
  'get': 'get',
  'post': 'add',
  'delete': 'delete',
  'put': 'edit'
}
// 自定义api导出方法名称
const getExportFuncName = (api) => {
  const pathReg = new RegExp('^\{+.*\}$');
  const pathSplit = api.split('/')
    .filter(i=>!!i && !pathReg.test(i))
    .map(i=>upperFirstKey(i));
  return pathSplit.join('');
}

const formatPaths = (paths) => {
  const pathList = [];
  for(let key in paths) {
    const control = paths[key];
    for(let methodKey in control) {
      const parameters = control[methodKey].parameters;
      const target = {
        api: key,
        method: methodKey,
        summary: control[methodKey].summary,
        name: `${methodMap[methodKey]}${getExportFuncName(key)}`,
        pathParams: parameters.filter((item) => item.in === 'path'),
        bodyParams: parameters.filter((item) => item.in === 'body'),
        queryParams: parameters.filter((item) => item.in === 'query'),
      };
      pathList.push(target);
    }
  }
  return pathList;
}

export {
  changeFile,
  formatPaths,
  upperFirstKey,
}