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
var BuildService = /** @class */ (function (_super) {
    __extends(BuildService, _super);
    function BuildService() {
        var _this_1 = _super.call(this) || this;
        _this_1.generator = function (source, defList) {
            var ast = recast_1.parse(source);
            var _this = _this_1;
            ast_types_1.visit(ast, {
                visitProgram: function (path) {
                    defList.map(function (i) {
                        if (i.type === 'object') {
                            path.get("body").push(_this.addExportNamedDeclaration(i));
                        }
                        else {
                            path.get("body").push(_this.addTsEnumDeclaration(i));
                        }
                    });
                    this.traverse(path);
                }
            });
            return recast_1.prettyPrint(ast, { tabWidth: 2 }).code;
        };
        return _this_1;
    }
    BuildService.prototype.addExportNamedDeclaration = function (i) {
        return ast_types_1.builders.exportNamedDeclaration(_super.prototype.getInterfaceDeclaration.call(this, i));
    };
    BuildService.prototype.addTsEnumDeclaration = function (i) {
        return _super.prototype.getTsEnumDeclaration.call(this, i);
    };
    return BuildService;
}(Base_1["default"]));
exports["default"] = BuildService;
