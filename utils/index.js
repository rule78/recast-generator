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
const formatPaths = (paths) => {
  const pathList = [];
  for(let key in paths) {
    // 可做非约定api约定容错
    const pathSplit = key.split('/');
    const control = paths[key];
    for(let methodKey in control) {
      const target = {};
      const parameters = control[methodKey].parameters;
      const pathParams = [];
      for(let pKey in parameters) {
        const type = parameters[pKey].in
        if (type === 'body') {
          target.hasBodyParam = true;
        }
        if (type === 'query') {
          target.hasQueryParam = true;
        }
        if (type === 'path') {
          pathParams.push(parameters[pKey]);
        }
      }
      target.api = key;
      target.method = methodKey;
      target.summary = control[methodKey].summary;
      target.name = `${methodMap[methodKey]}${upperFirstKey(pathSplit[2])}`;
      target.pathParams = pathParams;
      pathList.push(target);
    }
  }
  return pathList;
}

export {
  changeFile,
  formatPaths,
}