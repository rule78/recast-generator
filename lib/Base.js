"use strict";
exports.__esModule = true;
var ast_types_1 = require("ast-types");
var format_1 = require("./utils/format");
var utils_1 = require("./utils");
var Base = /** @class */ (function () {
    function Base() {
        this.importType = [];
        this.serviceParams = [];
    }
    // Important构建器：生成默认导入节点
    Base.prototype.getImportDefaultDeclaration = function (name, dir) {
        return ast_types_1.builders.importDeclaration([ast_types_1.builders.importDefaultSpecifier(ast_types_1.builders.identifier(name))], ast_types_1.builders.literal(dir));
    };
    // Important构建器：生成析构导入节点
    Base.prototype.getImportDeclaration = function (name, dir) {
        return ast_types_1.builders.importDeclaration([ast_types_1.builders.importSpecifier(ast_types_1.builders.identifier(name), ast_types_1.builders.identifier(name))], ast_types_1.builders.literal(dir));
    };
    // Object构建器：生成请求参数节点
    Base.prototype.getObjectExpression = function (propList) {
        var target = propList.map(function (i) {
            return ast_types_1.builders.property('init', ast_types_1.builders.identifier(i), ast_types_1.builders.identifier(i));
        });
        return target;
    };
    // stringTpl构建器：生成字符串模板节点
    Base.prototype.getTemplateLiteral = function (api, pathParams) {
        var qList = api.split(/{|}/);
        var expressions = pathParams.map(function (i) {
            return ast_types_1.builders.identifier(i.name);
        });
        var quasis = qList.filter(function (i) { return !pathParams.map(function (i) { return i.name; }).includes(i); }).map(function (i) {
            return ast_types_1.builders.templateElement({ raw: i, cooked: i }, true);
        });
        return ast_types_1.builders.templateLiteral(quasis, expressions);
    };
    // 
    Base.prototype.getTypeAnnotation = function (i) {
        // url参数取name，body参数取data,query参数取params
        var arg = ast_types_1.builders.identifier(i.name);
        // 缺少ref类型转化
        arg.typeAnnotation = ast_types_1.builders.typeAnnotation(ast_types_1.builders.genericTypeAnnotation(ast_types_1.builders.identifier(i.type === 'integer' ? 'number' : i.type), null // params
        ));
        return arg;
    };
    // Aliases: Statement, Declaration
    Base.prototype.getTsEnumDeclaration = function (i) {
        // numericLiteral
        var getInitializer = function (value) {
            return i.enumType === 'string' ? ast_types_1.builders.stringLiteral(value) : null;
        };
        return ast_types_1.builders.tsEnumDeclaration(ast_types_1.builders.identifier(i.name), i.values.map(function (m) { return ast_types_1.builders.tsEnumMember(ast_types_1.builders.identifier(m), getInitializer(m)); }));
    };
    // Aliases: TSType
    Base.prototype.getReferenceTSType = function (name) {
        return ast_types_1.builders.tsTypeReference(ast_types_1.builders.identifier(name));
    };
    // Aliases: TSType
    Base.prototype.getTSType = function (data, propKey) {
        var name = data.name, properties = data.properties;
        var item = properties[propKey];
        var baseType = ['boolean', 'string', 'number', 'integer'];
        // enum类型引用
        if (item["enum"]) {
            return this.getReferenceTSType("" + name + utils_1.upperFirstKey(propKey));
        }
        if (baseType.includes(item.type)) {
            return this.getReferenceTSType(item.type);
        }
        if (item.type === 'array') {
            // 数组类型 仅可接受一类型参数
            var parameterName = item.items.type ||
                format_1.formatRefName(item.items.$ref);
            return ast_types_1.builders.tsTypeReference(ast_types_1.builders.identifier('Array'), ast_types_1.builders.tsTypeParameterInstantiation(//泛型
            [ast_types_1.builders.tsTypeReference(ast_types_1.builders.identifier(parameterName))]));
        }
        return this.getReferenceTSType(format_1.formatRefName(item.$ref));
    };
    //Aliases: Statement, Declaration
    Base.prototype.getInterfaceDeclaration = function (i) {
        var _this = this;
        var props = i.properties;
        var InterfaceBody = Object.keys(props).map(function (key) {
            return ast_types_1.builders.tsPropertySignature(ast_types_1.builders.identifier(key), ast_types_1.builders.tsTypeAnnotation(_this.getTSType(i, key)), i.required ? !i.required.includes(key) : false);
        });
        return ast_types_1.builders.tsInterfaceDeclaration(ast_types_1.builders.identifier(i.name), ast_types_1.builders.tsInterfaceBody(InterfaceBody));
    };
    return Base;
}());
exports["default"] = Base;
