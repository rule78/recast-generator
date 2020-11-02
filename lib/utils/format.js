"use strict";
exports.__esModule = true;
exports.formatSchema = exports.formatRefName = exports.getExtraDefinitions = exports.getFileNameByPaths = exports.filterPaths = exports.unique = void 0;
// 首字母大写
var upperFirstKey = function (name) {
    return name.charAt(0).toUpperCase() + name.slice(1);
};
/**
 * 根据子项key值数组去重
 * @param {Array} arr 传入数组
 * @param {String} key 子项key值
 * @return {Array} 返回新数组
 */
function unique(arr, key) {
    var res = new Map();
    return arr.filter(function (a) { return !res.has(a[key]) && res.set(a[key], 1); });
}
exports.unique = unique;
/**
 * 筛选属于该controller的api
 * @param {String} controlName 名称
 * @param {Object} paths swagger docs paths
 * @return {Object} 返回新对象
 */
exports.filterPaths = function (controlName, paths) {
    var target = {};
    Object.keys(paths).forEach(function (i) {
        var path = paths[i];
        var methodList = Object.values(path);
        for (var m = 0; m < methodList.length; m++) {
            if (methodList[m] && methodList[m].tags.includes(controlName)) {
                target[i] = paths[i];
                return;
            }
        }
    });
    return target;
};
// 根据paths关键字权重获取合适的文件名
exports.getFileNameByPaths = function (paths) {
    var keys = Object.keys(paths).map(function (i) {
        var pathSplit = i.split('/');
        return pathSplit[2];
    });
    var maxEle;
    var maxNum = 1;
    keys.reduce(function (p, k) {
        p[k] ? p[k]++ : p[k] = 1;
        if (p[k] > maxNum) {
            maxEle = k;
            maxNum++;
        }
        return p;
    }, {});
    return maxEle;
};
// 获取额外值声明
exports.getExtraDefinitions = function (def) {
    var target = [];
    // object name
    Object.keys(def).forEach(function (key) {
        var props = def[key].properties;
        // prop name
        Object.keys(props).forEach(function (i) {
            if (props[i].type === 'integer') {
                props[i].type = 'number';
            }
            if (props[i]["enum"]) {
                target.push({
                    name: "" + key + upperFirstKey(i),
                    type: 'enum',
                    values: props[i]["enum"],
                    enumType: props[i].type
                });
            }
        });
        // 简单定义基础类型名称
        target.push(Object.assign(def[key], { name: key }));
    });
    return target;
};
// 格式化ref接口名称
exports.formatRefName = function (ref) {
    //ref '#/definitions/Category'
    var nameSplit = ref.split('/');
    return nameSplit[2];
};
// 获取schema引用的类型
exports.formatSchema = function (schema) {
    if (schema.type === 'array') {
        var params = exports.formatRefName(schema.items.$ref);
        return "Array<" + params + ">";
    }
    return exports.formatRefName(schema.$ref);
};
