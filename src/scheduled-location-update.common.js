"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var app = require("@nativescript/core/Application");
var dialogs = require("@nativescript/core/Dialogs");
var Common = (function (_super) {
    __extends(Common, _super);
    function Common() {
        var _this = _super.call(this) || this;
        _this.message = Utils.SUCCESS_MSG();
        return _this;
    }
    Common.prototype.greet = function () {
        return "Hello, NS";
    };
    return Common;
}(UIResponder));
exports.Common = Common;
var Utils = (function () {
    function Utils() {
    }
    Utils.SUCCESS_MSG = function () {
        var msg = "Your plugin LOC is working on " + (app.android ? 'Android' : 'iOS') + ".";
        setTimeout(function () {
            dialogs.alert(msg + " For real. It's really working :)").then(function () { return console.log("Dialog closed."); });
        }, 2000);
        return msg;
    };
    return Utils;
}());
exports.Utils = Utils;
//# sourceMappingURL=scheduled-location-update.common.js.map