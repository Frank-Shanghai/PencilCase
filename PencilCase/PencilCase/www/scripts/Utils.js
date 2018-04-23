define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function guid() {
        var p8 = function (s) {
            var p = (Math.random().toString(16) + "000000000").substr(2, 8);
            return s ? "-" + p.substr(0, 4) + "-" + p.substr(4, 4) : p;
        };
        return p8(false) + p8(true) + p8(true) + p8(false);
    }
    exports.guid = guid;
});
//# sourceMappingURL=Utils.js.map