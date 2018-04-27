var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
define(["require", "exports", "./PageBase", "../Navigator"], function (require, exports, PageBase_1, Navigator_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Retail = (function (_super) {
        __extends(Retail, _super);
        function Retail() {
            var _this = _super.call(this) || this;
            _this.navigator = Navigator_1.Navigator.instance;
            return _this;
        }
        return Retail;
    }(PageBase_1.PageBase));
    exports.Retail = Retail;
});
//# sourceMappingURL=Retail.js.map