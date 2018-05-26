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
define(["require", "exports", "./PageBase", "../Navigator", "../Models/Product", "../Repositories/ProductRepository", "../Repositories/OrderRepository", "../Models/Order", "../Utils", "../Models/Order"], function (require, exports, PageBase_1, Navigator_1, Product_1, ProductRepository_1, OrderRepository_1, Order_1, Utils, Order_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var DealPageBase = (function (_super) {
        __extends(DealPageBase, _super);
        function DealPageBase() {
            var _this = _super.call(this) || this;
            _this.navigator = Navigator_1.Navigator.instance;
            _this.products = ko.observableArray([]);
            _this.dict = {};
            _this.selectOptions = { Id: "placeholder", Name: "选择产品……", RetailPrice: 0, RetailUnitName: '', WholesalePrice: 0, WholesaleUnitName: '' };
            _this.selectedProductId = ko.observable(_this.selectOptions.Id);
            _this.selectedProduct = ko.observable(_this.selectOptions);
            _this.productSelected = ko.computed(function () {
                if (_this.selectedProduct() && _this.selectedProduct().Id !== _this.selectOptions.Id)
                    return true;
                return false;
            });
            _this.selectedProductQuantity = ko.observable(1);
            _this.clearSelection = ko.observable(false);
            _this.orders = ko.observableArray([]);
            _this.batchId = null;
            _this.totalNumber = ko.observable(0);
            _this.totalPrice = ko.observable(0);
            _this.productRepository = new ProductRepository_1.ProductRepository();
            _this.orderRepository = new OrderRepository_1.OrderRepository();
            _this.addOrderWithSpecifiedPrice = function (price) {
                if (_this.batchId == null)
                    _this.batchId = Utils.guid();
                var isNew = true;
                for (var i = 0; i < _this.orders().length; i++) {
                    if (_this.orders()[i].product().Id === _this.selectedProduct().Id) {
                        // order.total is a ko.computed observable, so, when quantity changed, the total will be updated automatically
                        _this.orders()[i].quantity(_this.orders()[i].quantity() + _this.selectedProductQuantity());
                        _this.totalPrice(_this.totalPrice() + _this.selectedProductQuantity() * price);
                        isNew = false;
                        break;
                    }
                }
                if (isNew) {
                    var order = new Order_1.Order(Utils.guid(), _this.batchId, _this.selectedProduct(), Order_2.OrderTypes.Import, _this.selectedProductQuantity(), price);
                    _this.orders.push(order);
                    _this.totalPrice(_this.totalPrice() + order.total());
                }
                _this.totalNumber(_this.totalNumber() + _this.selectedProductQuantity());
                _this.cancelOrderAdding();
            };
            _this.cancelOrderAdding = function () {
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
            _this.increaseOrderProductQuantity = function (order) {
                order.quantity(order.quantity() + 1);
                _this.totalNumber(_this.totalNumber() + 1);
                // Have the order.price() * 1 here, because the order.praice is string, need this * 1 to make it as a number
                _this.totalPrice(_this.totalPrice() + order.price() * 1);
            };
            _this.decreaseOrderProductQuantity = function (order) {
                if (order.quantity() > 0) {
                    order.quantity(order.quantity() - 1);
                    _this.totalNumber(_this.totalNumber() - 1);
                    // Have the order.price() * 1 here, because the order.praice is string, need this * 1 to make it as a number
                    _this.totalPrice(_this.totalPrice() - order.price() * 1);
                }
            };
            _this.deleteOrder = function (order) {
                _this.orders.remove(order);
                _this.totalNumber(_this.totalNumber() - order.quantity());
                _this.totalPrice(_this.totalPrice() - order.total());
            };
            _this.cancelOrders = function () {
                _this.orders([]);
                _this.totalNumber(0);
                _this.totalPrice(0);
                _this.batchId = null;
                _this.cancelOrderAdding();
            };
            _this.back = Navigator_1.Navigator.instance.goHome;
            return _this;
        }
        DealPageBase.prototype.initialize = function () {
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
        return DealPageBase;
    }(PageBase_1.PageBase));
    exports.DealPageBase = DealPageBase;
});
//# sourceMappingURL=DealPageBase.js.map