"use strict";
exports.__esModule = true;
exports.upperFirstKey = exports.formatPaths = exports.changeFile = void 0;
var fs = require('fs');
var changeFile = function (dir, code, cd) {
    fs.access(dir, function (err) {
        if (!err) {
            fs.writeFile(dir, code, function (err) {
                if (err) {
                    return console.log(err);
                }
                if (cd) {
                    cd();
                }
                else {
                    console.log("\u6210\u529F\u5199\u5165!" + dir);
                }
            });
        }
        else {
            console.log('该文件不存在');
        }
    });
};
exports.changeFile = changeFile;
var upperFirstKey = function (name) {
    return name.charAt(0).toUpperCase() + name.slice(1);
};
exports.upperFirstKey = upperFirstKey;
// 映射method对应action
var methodMap = {
    'get': 'get',
    'post': 'add',
    'delete': 'delete',
    'put': 'edit'
};
// 自定义api导出方法名称
var getExportFuncName = function (api) {
    var pathReg = new RegExp('^\{+.*\}$');
    var pathSplit = api.split('/')
        .filter(function (i) { return !!i && !pathReg.test(i); })
        .map(function (i) { return upperFirstKey(i); });
    return pathSplit.join('');
};
// 缺少formData类型参数
var formatPaths = function (paths) {
    var pathList = [];
    for (var key in paths) {
        var control = paths[key];
        for (var methodKey in control) {
            var _a = control[methodKey], parameters = _a.parameters, operationId = _a.operationId, summary = _a.summary, responses = _a.responses;
            var target = {
                api: key,
                method: methodKey,
                summary: summary,
                name: operationId || "" + methodMap[methodKey] + getExportFuncName(key),
                pathParams: parameters.filter(function (item) { return item["in"] === 'path'; }),
                bodyParams: parameters.filter(function (item) { return item["in"] === 'body'; }),
                queryParams: parameters.filter(function (item) { return item["in"] === 'query'; }),
                responses: responses
            };
            pathList.push(target);
        }
    }
    return pathList;
};
exports.formatPaths = formatPaths;
