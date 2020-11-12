"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var format_1 = require("../lib/utils/format");
var utils_1 = require("../lib/utils");
var format_2 = require("../lib/utils/format");
var Service_1 = require("../lib/Service");
var Interface_1 = require("../lib/Interface");
var fs = require('fs');
var path = require('path');
var request = require('request');
var qoa = require('qoa');
// swagger api-docs
var api = 'https://petstore.swagger.io/v2/swagger.json';
console.log("try to request " + api);
var cb = function (err, response) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, tags, paths, definitions, selectList, selectControl, cRes, p, serviceDir_1, serviceSource, buildServiceInst, interDir_1, interSource, buildInterfaceInst;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                if (!(!err && response.statusCode == 200)) return [3 /*break*/, 2];
                console.log('success request!');
                _a = JSON.parse(response.body), tags = _a.tags, paths = _a.paths, definitions = _a.definitions;
                selectList = tags.filter(function (i) { return i.name !== 'pet'; });
                selectControl = {
                    type: 'interactive',
                    query: 'Select your api controller:',
                    handle: 'control',
                    symbol: '>',
                    menu: selectList.map(function (i) { return i.name; })
                };
                return [4 /*yield*/, qoa.prompt([selectControl])];
            case 1:
                cRes = _b.sent();
                p = format_1.filterPaths(cRes.control, paths);
                serviceDir_1 = path.join("./service.ts");
                serviceSource = fs.readFileSync(serviceDir_1, "utf8");
                buildServiceInst = new Service_1["default"]();
                utils_1.changeFile(serviceDir_1, buildServiceInst.generator(serviceSource, p), function () {
                    console.log("\u6210\u529F\u5199\u5165\u6587\u4EF6" + serviceDir_1);
                });
                interDir_1 = path.join("./data.ts");
                interSource = fs.readFileSync(interDir_1, "utf8");
                buildInterfaceInst = new Interface_1["default"]();
                utils_1.changeFile(interDir_1, buildInterfaceInst.generator(interSource, format_2.getExtraDefinitions(definitions)), function () {
                    console.log("\u6210\u529F\u5199\u5165\u6587\u4EF6" + interDir_1);
                });
                _b.label = 2;
            case 2: return [2 /*return*/];
        }
    });
}); };
request(api, cb);
