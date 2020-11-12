"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
exports.__esModule = true;
var recast_1 = require("recast");
var ast_types_1 = require("ast-types");
var Base_1 = require("./Base");
var utils_1 = require("./utils");
var format_1 = require("./utils/format");
var BuildService = /** @class */ (function (_super) {
    __extends(BuildService, _super);
    function BuildService() {
        var _this_1 = _super.call(this) || this;
        // func构建器：生成request函数声明
        _this_1.getFunctionDeclaration = function (config) {
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
                    funcParams.push(_super.prototype.getTypeAnnotation.call(_this_1, i));
                });
                apiNode = _super.prototype.getTemplateLiteral.call(_this_1, api, pathParams);
            }
            else {
                apiNode = ast_types_1.builders.stringLiteral(api);
            }
            // url参数
            if (queryParams.length > 0) {
                var exportTpye = exportName + "Params";
                funcParams.push(_super.prototype.getTypeAnnotation.call(_this_1, {
                    name: 'params',
                    type: exportTpye
                }));
                // 添加query参数类型声明
                _this_1.serviceParams.push({
                    name: exportTpye,
                    params: queryParams
                });
                methodProps.push('params');
            }
            // 请求主体被发送的数据
            if (bodyParams.length > 0) {
                funcParams.push(_super.prototype.getTypeAnnotation.call(_this_1, {
                    name: 'data',
                    type: format_1.formatSchema(bodyParams[0].schema)
                }));
                methodProps.push('data');
            }
            var funcParamsNode = [apiNode];
            if (queryParams.length > 0 || bodyParams.length > 0) {
                funcParamsNode.push(ast_types_1.builders.objectExpression(// method参数数组
                _super.prototype.getObjectExpression.call(_this_1, methodProps)));
            }
            var declaration = ast_types_1.builders.functionDeclaration(ast_types_1.builders.identifier(exportName), funcParams, // func参数
            ast_types_1.builders.blockStatement([
                ast_types_1.builders.variableDeclaration("const", [
                    ast_types_1.builders.variableDeclarator(ast_types_1.builders.identifier('res'), ast_types_1.builders.yieldExpression(ast_types_1.builders.callExpression(// 方法调用
                    ast_types_1.builders.memberExpression(ast_types_1.builders.identifier('request'), ast_types_1.builders.identifier(method)), funcParamsNode)))
                ]),
                ast_types_1.builders.returnStatement(ast_types_1.builders.identifier('res'))
            ]), true);
            declaration.returnType = ast_types_1.builders.tsTypeAnnotation(ast_types_1.builders.tsTypeReference(ast_types_1.builders.identifier('ResType'), _this_1.getParameterInstantiation(responses)));
            return declaration;
        };
        return _this_1;
    }
    // ParameterInstantiation：泛型参数
    BuildService.prototype.getParameterInstantiation = function (res) {
        var _a, _b;
        if ((_b = (_a = res[200 /* success */]) === null || _a === void 0 ? void 0 : _a.schema) === null || _b === void 0 ? void 0 : _b.$ref) {
            return ast_types_1.builders.tsTypeParameterInstantiation(//泛型
            [ast_types_1.builders.tsTypeReference(ast_types_1.builders.identifier(format_1.formatRefName(res[200 /* success */].schema.$ref)))]);
        }
        return ast_types_1.builders.tsTypeParameterInstantiation(//泛型
        [ast_types_1.builders.tsTypeReference(ast_types_1.builders.identifier('{}'))]);
    };
    BuildService.prototype.addImportNode = function (path) {
        // request import
        var imporNode = path.node.body.find(function (i) { return i.type === 'ImportDeclaration'; });
        if (!imporNode) {
            path.get("body").unshift(_super.prototype.getImportDefaultDeclaration.call(this, 'request', '@/utils/request'));
            path.get("body").unshift(_super.prototype.getImportDeclaration.call(this, 'ResType', '@/types'));
        }
    };
    BuildService.prototype.addExportNode = function (paths, path) {
        var _this_1 = this;
        utils_1.formatPaths(paths).forEach(function (i, index) {
            var sameExportNode = path.node.body.find(function (e) {
                if (e.type === 'ExportNamedDeclaration' && e.declaration.id) {
                    return e.declaration.id.name === i.name;
                }
                return false;
            });
            if (!sameExportNode) { // 不存在该方法声明时
                path.get("body").push(ast_types_1.builders.exportNamedDeclaration(_this_1.getFunctionDeclaration(i)));
                // 通过方法index映射注释
                var funcNodeList = path.node.body.filter(function (i) { return i.declaration; });
                funcNodeList[index].comments = [ast_types_1.builders.commentLine(i.summary)];
            }
            return;
        });
    };
    BuildService.prototype.addParamsTypeAnnotation = function () {
        // console.log(this.serviceParams, 'serviceParamsDeclaration');
    };
    BuildService.prototype.generator = function (source, paths) {
        var ast = recast_1.parse(source);
        var _this = this;
        ast_types_1.visit(ast, {
            visitProgram: function (path) {
                _this.addImportNode(path);
                _this.addExportNode(paths, path);
                _this.addParamsTypeAnnotation();
                this.traverse(path);
            }
        });
        return recast_1.prettyPrint(ast, { tabWidth: 2 }).code;
    };
    return BuildService;
}(Base_1["default"]));
exports["default"] = BuildService;
