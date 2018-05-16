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
define(["require", "exports", "./PageBase", "../Navigator", "./Consts", "../Models/Product", "../Repositories/ProductRepository"], function (require, exports, PageBase_1, Navigator_1, Consts, Product_1, ProductRepository_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var ProductManagement = (function (_super) {
        __extends(ProductManagement, _super);
        function ProductManagement() {
            var _this = _super.call(this) || this;
            _this.navigator = Navigator_1.Navigator.instance;
            _this.products = ko.observableArray([]);
            _this.productRepository = new ProductRepository_1.ProductRepository();
            _this.addNewProduct = function () {
                _this.navigator.navigateTo(Consts.Pages.ProductEditor, {
                    data: {
                        parameters: {
                            product: null
                        }
                    },
                    changeHash: true
                });
            };
            _this.showDetails = function (product) {
                _this.navigator.navigateTo(Consts.Pages.ProductEditor, {
                    data: {
                        parameters: {
                            product: product
                        }
                    },
                    changeHash: true
                });
            };
            _this.onDBError = function (transaction, sqlError) {
                alert("Product Management Page: " + sqlError.message);
            };
            _this.title = ko.observable("Product Management");
            _this.pageId = Consts.Pages.ProductManagement.Id;
            _this.back = Navigator_1.Navigator.instance.goHome;
            return _this;
        }
        ProductManagement.prototype.initialize = function () {
            var _this = this;
            var productRepository = new ProductRepository_1.ProductRepository();
            productRepository.getAll(function (transaction, resultSet) {
                _this.products([]); // First, clear products collection
                var rows = resultSet.rows;
                for (var i = 0; i < rows.length; i++) {
                    _this.products.push(new Product_1.Product(rows.item(i)));
                }
            }, this.onDBError);
        };
        return ProductManagement;
    }(PageBase_1.PageBase));
    exports.ProductManagement = ProductManagement;
});
//# sourceMappingURL=ProductManagement.js.map