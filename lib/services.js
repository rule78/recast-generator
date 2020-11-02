"use strict";
exports.__esModule = true;
var recast_1 = require("recast");
var ast_types_1 = require("ast-types");
var utils_1 = require("./utils");
var format_1 = require("./utils/format");
// Important构建器：生成默认导入节点
var getImportDefaultDeclaration = function (name, dir) {
    return ast_types_1.builders.importDeclaration([ast_types_1.builders.importDefaultSpecifier(ast_types_1.builders.identifier(name))], ast_types_1.builders.literal(dir));
};
// Important构建器：生成析构导入节点
var getImportDeclaration = function (name, dir) {
    return ast_types_1.builders.importDeclaration([ast_types_1.builders.importSpecifier(ast_types_1.builders.identifier(name), ast_types_1.builders.identifier(name))], ast_types_1.builders.literal(dir));
};
// ParameterInstantiation：泛型参数
var getParameterInstantiation = function (res) {
    var _a, _b;
    if ((_b = (_a = res[200 /* success */]) === null || _a === void 0 ? void 0 : _a.schema) === null || _b === void 0 ? void 0 : _b.$ref) {
        return ast_types_1.builders.tsTypeParameterInstantiation(//泛型
        [ast_types_1.builders.tsTypeReference(ast_types_1.builders.identifier(format_1.formatRefName(res[200 /* success */].schema.$ref)))]);
    }
    return ast_types_1.builders.tsTypeParameterInstantiation(//泛型
    [ast_types_1.builders.tsTypeReference(ast_types_1.builders.identifier('{}'))]);
};
// Object构建器：生成axios请求参数节点
var getObjectExpression = function (propList) {
    var target = propList.map(function (i) {
        return ast_types_1.builders.property('init', ast_types_1.builders.identifier(i), ast_types_1.builders.identifier(i));
    });
    return target;
};
// stringTpl构建器：生成字符串模板节点
var getTemplateLiteral = function (api, pathParams) {
    var qList = api.split(/{|}/);
    var expressions = pathParams.map(function (i) {
        return ast_types_1.builders.identifier(i.name);
    });
    var quasis = qList.filter(function (i) { return !pathParams.map(function (i) { return i.name; }).includes(i); }).map(function (i) {
        return ast_types_1.builders.templateElement({ raw: i, cooked: i }, true);
    });
    return ast_types_1.builders.templateLiteral(quasis, expressions);
};
var getTypeAnnotation = function (i) {
    // url参数取name，body参数取data,query参数取params
    var arg = ast_types_1.builders.identifier(i.name);
    // 缺少ref类型转化
    arg.typeAnnotation = ast_types_1.builders.typeAnnotation(ast_types_1.builders.genericTypeAnnotation(ast_types_1.builders.identifier(i.type === 'integer' ? 'number' : i.type), null // params
    ));
    return arg;
};
// func构建器：生成request函数声明
var getFunctionDeclaration = function (config) {
    var _a = config.method, method = _a === void 0 ? "get" : _a, exportName = config.name, _b = config.api, api = _b === void 0 ? '/api/' : _b, queryParams = config.queryParams, // query请求参数
    bodyParams = config.bodyParams, // body请求参数
    pathParams = config.pathParams, // path请求参数
    responses = config.responses;
    var funcParams = []; // 声明函数传参
    var methodProps = []; // method参数数组
    var apiNode = null;
    // 参数顺序 path、query、body、formData
    if (pathParams.length > 0) {
        pathParams.map(function (i) {
            funcParams.push(getTypeAnnotation(i));
        });
        apiNode = getTemplateLiteral(api, pathParams);
    }
    else {
        apiNode = ast_types_1.builders.stringLiteral(api);
    }
    // url参数
    if (queryParams.length > 0) {
        funcParams.push(ast_types_1.builders.identifier('params'));
        methodProps.push('params');
    }
    // 请求主体被发送的数据
    if (bodyParams.length > 0) {
        funcParams.push(getTypeAnnotation({
            name: 'data',
            type: format_1.formatSchema(bodyParams[0].schema)
        }));
        methodProps.push('data');
    }
    var funcParamsNode = [apiNode];
    if (queryParams.length > 0 || bodyParams.length > 0) {
        funcParamsNode.push(ast_types_1.builders.objectExpression(// method参数数组
        getObjectExpression(methodProps)));
    }
    var declaration = ast_types_1.builders.functionDeclaration(ast_types_1.builders.identifier(exportName), funcParams, // func参数
    ast_types_1.builders.blockStatement([
        ast_types_1.builders.variableDeclaration("const", [
            ast_types_1.builders.variableDeclarator(ast_types_1.builders.identifier('res'), ast_types_1.builders.yieldExpression(ast_types_1.builders.callExpression(// 方法调用
            ast_types_1.builders.memberExpression(ast_types_1.builders.identifier('request'), ast_types_1.builders.identifier(method)), funcParamsNode)))
        ]),
        ast_types_1.builders.returnStatement(ast_types_1.builders.identifier('res'))
    ]), true);
    declaration.returnType = ast_types_1.builders.tsTypeAnnotation(ast_types_1.builders.tsTypeReference(ast_types_1.builders.identifier('ResType'), getParameterInstantiation(responses)));
    return declaration;
};
/**
 * service generator
 * @param {String} source 原代码
 * @param {Object} paths swagger docs paths
 * @return {String} 返回新代码
 */
var generator = function (source, paths) {
    var ast = recast_1.parse(source);
    ast_types_1.visit(ast, {
        visitProgram: function (path) {
            // request import
            var imporNode = path.node.body.find(function (i) { return i.type === 'ImportDeclaration'; });
            if (!imporNode) {
                path.get("body").unshift(getImportDefaultDeclaration('request', '@/utils/request'));
                path.get("body").unshift(getImportDeclaration('ResType', '@/types'));
            }
            utils_1.formatPaths(paths).forEach(function (i, index) {
                var sameExportNode = path.node.body.find(function (e) {
                    if (e.type === 'ExportNamedDeclaration' && e.declaration.id) {
                        return e.declaration.id.name === i.name;
                    }
                    return false;
                });
                if (!sameExportNode) { // 不存在该方法声明时
                    path.get("body").push(ast_types_1.builders.exportNamedDeclaration(getFunctionDeclaration(i)));
                    // 通过方法index映射注释
                    var funcNodeList = path.node.body.filter(function (i) { return i.declaration; });
                    funcNodeList[index].comments = [ast_types_1.builders.commentLine(i.summary)];
                }
                return;
            });
            this.traverse(path);
        }
    });
    return recast_1.prettyPrint(ast, { tabWidth: 2 }).code;
};
exports["default"] = generator;
