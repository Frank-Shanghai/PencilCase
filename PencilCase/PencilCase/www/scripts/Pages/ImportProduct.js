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
    var ImportProduct = (function (_super) {
        __extends(ImportProduct, _super);
        function ImportProduct() {
            var _this = _super.call(this) || this;
            _this.navigator = Navigator_1.Navigator.instance;
            _this.products = ko.observableArray([]);
            _this.dict = {};
            _this.selectOptions = { Id: "placeholder", Name: "选择产品……", WholesalePrice: 0, WholesaleUnitName: '' };
            _this.selectedProductId = ko.observable(_this.selectOptions.Id);
            _this.selectedProduct = ko.observable(_this.selectOptions);
            _this.productSelected = ko.computed(function () {
                if (_this.selectedProduct() && _this.selectedProduct().Id !== _this.selectOptions.Id)
                    return true;
                return false;
            });
            _this.selectedProductQuantity = ko.observable(1);
            _this.clearSelection = ko.observable(false);
            _this.selectedProducts = ko.observableArray([]);
            _this.addProduct = function () {
                //Add Product
                var isNew = true;
                for (var i = 0; i < _this.selectedProducts().length; i++) {
                    if (_this.selectedProducts()[i].product.Id === _this.selectedProduct().Id) {
                        _this.selectedProducts()[i].quantity(_this.selectedProducts()[i].quantity() + _this.selectedProductQuantity());
                        isNew = false;
                        break;
                    }
                }
                if (isNew) {
                    _this.selectedProducts.push({
                        product: _this.selectedProduct(),
                        quantity: ko.observable(_this.selectedProductQuantity()),
                        total: 100
                    });
                }
                _this.cancelProductAdding();
            };
            _this.cancelProductAdding = function () {
                _this.selectedProductId(_this.selectOptions.Id);
                _this.clearSelection(true);
                _this.selectedProductQuantity(1);
            };
            _this.increaseQuantity = function () {
                _this.selectedProductQuantity(_this.selectedProductQuantity() + 1);
            };
            _this.decreaseQuantity = function () {
                if (_this.selectedProductQuantity() > 0)
                    _this.selectedProductQuantity(_this.selectedProductQuantity() - 1);
            };
            _this.onDBError = function (transaction, sqlError) {
                alert("Import Product Page: " + sqlError.message);
            };
            _this.title = ko.observable("进货");
            _this.pageId = Consts.Pages.ImportProduct.Id;
            _this.back = Navigator_1.Navigator.instance.goHome;
            _this.selectedProductId.subscribe(function (newValue) {
                _this.selectedProduct(_this.dict[newValue]);
            });
            return _this;
        }
        ImportProduct.prototype.initialize = function () {
            var _this = this;
            var productRepository = new ProductRepository_1.ProductRepository();
            productRepository.getAll(function (transaction, resultSet) {
                _this.products([]); // First, clear products collection
                var rows = resultSet.rows;
                var array = [];
                _this.dict = {};
                for (var i = 0; i < rows.length; i++) {
                    //this.products.push(new Product(rows.item(i)));
                    array.push(new Product_1.Product(rows.item(i)));
                    _this.dict[(rows.item(i)).Id] = rows.item(i);
                }
                array.splice(0, 0, _this.selectOptions);
                _this.dict[_this.selectOptions.Id] = _this.selectOptions;
                _this.products(array);
            }, this.onDBError);
        };
        return ImportProduct;
    }(PageBase_1.PageBase));
    exports.ImportProduct = ImportProduct;
});
//# sourceMappingURL=ImportProduct.js.map