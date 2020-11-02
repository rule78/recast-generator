"use strict";
exports.__esModule = true;
var recast_1 = require("recast");
var ast_types_1 = require("ast-types");
var format_1 = require("./utils/format");
var utils_1 = require("./utils");
// Aliases: Statement, Declaration
var getTsEnumDeclaration = function (i) {
    // numericLiteral
    var getInitializer = function (value) {
        return i.enumType === 'string' ? ast_types_1.builders.stringLiteral(value) : null;
    };
    return ast_types_1.builders.tsEnumDeclaration(ast_types_1.builders.identifier(i.name), i.values.map(function (m) { return ast_types_1.builders.tsEnumMember(ast_types_1.builders.identifier(m), getInitializer(m)); }));
};
// Aliases: TSType
var getReferenceTSType = function (name) {
    return ast_types_1.builders.tsTypeReference(ast_types_1.builders.identifier(name));
};
// Aliases: TSType
var getTSType = function (data, propKey) {
    var name = data.name, properties = data.properties;
    var item = properties[propKey];
    var baseType = ['boolean', 'string', 'number', 'integer'];
    // enum类型引用
    if (item["enum"]) {
        return getReferenceTSType("" + name + utils_1.upperFirstKey(propKey));
    }
    if (baseType.includes(item.type)) {
        return getReferenceTSType(item.type);
    }
    if (item.type === 'array') {
        // 数组类型 仅可接受一类型参数
        var parameterName = item.items.type ||
            format_1.formatRefName(item.items.$ref);
        return ast_types_1.builders.tsTypeReference(ast_types_1.builders.identifier('Array'), ast_types_1.builders.tsTypeParameterInstantiation(//泛型
        [ast_types_1.builders.tsTypeReference(ast_types_1.builders.identifier(parameterName))]));
    }
    return getReferenceTSType(format_1.formatRefName(item.$ref));
};
//Aliases: Statement, Declaration
var getInterfaceDeclaration = function (i) {
    var props = i.properties;
    var InterfaceBody = Object.keys(props).map(function (key) {
        return ast_types_1.builders.tsPropertySignature(ast_types_1.builders.identifier(key), ast_types_1.builders.tsTypeAnnotation(getTSType(i, key)), i.required ? !i.required.includes(key) : false);
    });
    return ast_types_1.builders.tsInterfaceDeclaration(ast_types_1.builders.identifier(i.name), ast_types_1.builders.tsInterfaceBody(InterfaceBody));
};
var generator = function (source, defList) {
    var ast = recast_1.parse(source);
    ast_types_1.visit(ast, {
        visitProgram: function (path) {
            defList.map(function (i) {
                if (i.type === 'object') {
                    path.get("body").push(ast_types_1.builders.exportNamedDeclaration(getInterfaceDeclaration(i)));
                }
                else {
                    path.get("body").push(getTsEnumDeclaration(i));
                }
            });
            this.traverse(path);
        }
    });
    return recast_1.prettyPrint(ast, { tabWidth: 2 }).code;
};
exports["default"] = generator;
