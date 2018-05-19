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
define(["require", "exports", "./PageBase", "../Navigator", "./Consts", "../Models/product", "../Repositories/ProductRepository"], function (require, exports, PageBase_1, Navigator_1, Consts, product_1, ProductRepository_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var ImportProduct = (function (_super) {
        __extends(ImportProduct, _super);
        function ImportProduct() {
            var _this = _super.call(this) || this;
            _this.navigator = Navigator_1.Navigator.instance;
            _this.products = ko.observableArray([]);
            _this.selectedProduct = ko.observable(null);
            _this.onDBError = function (transaction, sqlError) {
                alert("Import Product Page: " + sqlError.message);
            };
            _this.title = ko.observable("进货");
            _this.pageId = Consts.Pages.ImportProduct.Id;
            _this.back = Navigator_1.Navigator.instance.goHome;
            return _this;
        }
        ImportProduct.prototype.initialize = function () {
            var _this = this;
            var productRepository = new ProductRepository_1.ProductRepository();
            productRepository.getAll(function (transaction, resultSet) {
                _this.products([]); // First, clear products collection
                var rows = resultSet.rows;
                var array = [];
                for (var i = 0; i < rows.length; i++) {
                    //this.products.push(new Product(rows.item(i)));
                    array.push(new product_1.Product(rows.item(i)));
                }
                _this.products(array);
            }, this.onDBError);
        };
        return ImportProduct;
    }(PageBase_1.PageBase));
    exports.ImportProduct = ImportProduct;
});
//# sourceMappingURL=ImportProduct.js.map