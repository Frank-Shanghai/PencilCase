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
define(["require", "exports", "./PageBase", "../Navigator", "./Consts"], function (require, exports, PageBase_1, Navigator_1, Consts) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var ProductEditor = (function (_super) {
        __extends(ProductEditor, _super);
        function ProductEditor(parameters) {
            var _this = _super.call(this) || this;
            _this.navigator = Navigator_1.Navigator.instance;
            _this.name = ko.observable('');
            _this.goBack = function () {
                _this.navigator.navigateTo(Consts.Pages.ProductManagement, {
                    changeHash: false,
                    dataUrl: "ProdutManagement"
                });
            };
            _this.title = ko.observable("Product Editor");
            _this.pageId = Consts.Pages.ProductEditor.Id;
            if (parameters && parameters.product) {
                _this.name = ko.observable(parameters.product.Name);
            }
            return _this;
        }
        return ProductEditor;
    }(PageBase_1.PageBase));
    exports.ProductEditor = ProductEditor;
});
//# sourceMappingURL=ProductEditor.js.map