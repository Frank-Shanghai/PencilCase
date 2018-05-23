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
define(["require", "exports", "./PageBase", "./Consts", "../Navigator"], function (require, exports, PageBase_1, Consts, Navigator_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var HomePage = (function (_super) {
        __extends(HomePage, _super);
        function HomePage() {
            var _this = _super.call(this) || this;
            _this.openProductManagementPage = function () {
                //this.navigator.navigateTo("Pages/ProductManagement.html", {
                _this.navigator.navigateTo(Consts.Pages.ProductManagement, {
                    changeHash: true,
                });
            };
            _this.openRetailPage = function () {
                _this.navigator.navigateTo(Consts.Pages.Retail, {
                    changeHash: true
                });
            };
            _this.openWholesalePage = function () {
                _this.navigator.navigateTo(Consts.Pages.Whosale, {
                    changeHash: true
                });
            };
            _this.openImportProductPage = function () {
                _this.navigator.navigateTo(Consts.Pages.ImportProduct, {
                    changeHash: true
                });
            };
            _this.pageId = Consts.Pages.HomePage.Id;
            _this.isPermanent = Consts.Pages.HomePage.IsPermanent;
            _this.navigator = Navigator_1.Navigator.instance;
            _this.title = ko.observable("Pencil Case");
            _this.footer = ko.observable("@Copyright - Frank");
            return _this;
        }
        return HomePage;
    }(PageBase_1.PageBase));
    exports.HomePage = HomePage;
});
//# sourceMappingURL=HomePage.js.map