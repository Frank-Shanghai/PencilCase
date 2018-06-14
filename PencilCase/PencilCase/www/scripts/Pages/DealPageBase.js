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
define(["require", "exports", "./PageBase", "../Navigator", "../Models/Product", "../Repositories/ProductRepository", "../Repositories/OrderRepository", "../Models/Order", "../Utils"], function (require, exports, PageBase_1, Navigator_1, Product_1, ProductRepository_1, OrderRepository_1, Order_1, Utils) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /*
    * Extend ko functionality
    * https://stackoverflow.com/questions/12822954/get-previous-value-of-an-observable-in-subscribe-of-same-observable
    */
    ko.subscribable.fn.subscribeChanged = function (callback, dataContext) {
        var savedValue = this.peek();
        return this.subscribe(function (latestValue) {
            var oldValue = savedValue;
            savedValue = latestValue;
            callback(latestValue, oldValue, dataContext);
        });
    };
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
            _this.orderQuantitySubscriptions = [];
            _this.invalidOrderCount = ko.observable(0);
            _this.numberOnlyRegExp = /^\d+$/;
            _this.addOrderWithSpecifiedPrice = function (price, type) {
                if (_this.batchId == null)
                    _this.batchId = Utils.guid();
                var isNew = true;
                for (var i = 0; i < _this.orders().length; i++) {
                    if (_this.orders()[i].product().Id === _this.selectedProduct().Id) {
                        // order.total is a ko.computed observable, so, when quantity changed, the total will be updated automatically
                        _this.orders()[i].quantity(Number(_this.orders()[i].quantity()) + Number(_this.selectedProductQuantity()));
                        // No need to update total price and totoal quantity since the order's subscribeChanged handler will handle them
                        //this.totalPrice(Number(this.totalPrice()) + Number(this.selectedProductQuantity() * price));
                        isNew = false;
                        break;
                    }
                }
                if (isNew) {
                    var order_1 = new Order_1.Order(Utils.guid(), _this.batchId, _this.selectedProduct(), type, _this.selectedProductQuantity(), price);
                    // Use the custom ko observable function subscribeChanged, refer to the file top code for more details about implementation
                    //https://stackoverflow.com/questions/12822954/get-previous-value-of-an-observable-in-subscribe-of-same-observable
                    _this.orderQuantitySubscriptions.push(order_1.quantity.subscribeChanged(function (newValue, oldValue) {
                        if (_this.numberOnlyRegExp.test(newValue) == false) {
                            if (_this.numberOnlyRegExp.test(oldValue)) {
                                _this.invalidOrderCount(_this.invalidOrderCount() + 1);
                            }
                        }
                        if (_this.numberOnlyRegExp.test(newValue)) {
                            if (_this.numberOnlyRegExp.test(oldValue) == false) {
                                _this.invalidOrderCount(_this.invalidOrderCount() - 1);
                            }
                        }
                        // Have to do such re-calculation even when quantity is invalid, because old value changed even quantity is invalid.
                        _this.totalNumber(Number(_this.totalNumber()) - Number(oldValue) + Number(newValue));
                        _this.totalPrice(Number(_this.totalPrice()) - Number(oldValue * order_1.price()) + Number(newValue * order_1.price()));
                    }, null, order_1));
                    _this.orders.push(order_1);
                    // For new added order, manually updte total number and total price for the first time
                    _this.totalNumber(Number(_this.totalNumber()) + Number(_this.selectedProductQuantity()));
                    _this.totalPrice(Number(_this.totalPrice()) + Number(order_1.total()));
                }
                _this.cancelOrderAdding();
            };
            _this.cancelOrderAdding = function () {
                _this.selectedProductId(_this.selectOptions.Id);
                _this.clearSelection(true);
                _this.selectedProductQuantity(1);
            };
            _this.increaseQuantity = function () {
                _this.selectedProductQuantity(Number(_this.selectedProductQuantity()) + 1);
            };
            _this.decreaseQuantity = function () {
                if (Number(_this.selectedProductQuantity()) > 0)
                    _this.selectedProductQuantity(Number(_this.selectedProductQuantity()) - 1);
            };
            _this.increaseOrderProductQuantity = function (order) {
                order.quantity(Number(order.quantity()) + 1);
                // No need to do this because the order's subscribeChanged handler will handle them
                //this.totalNumber(Number(this.totalNumber()) + 1);
                //this.totalPrice(Number(this.totalPrice()) + Number(order.price()));
            };
            _this.decreaseOrderProductQuantity = function (order) {
                if (Number(order.quantity()) > 0) {
                    order.quantity(Number(order.quantity()) - 1);
                    // No need to do this because the order's subscribeChanged handler will handle them
                    //this.totalNumber(Number(this.totalNumber()) - 1);
                    //this.totalPrice(Number(this.totalPrice()) - Number(order.price()));
                }
            };
            _this.deleteOrder = function (order) {
                _this.orders.remove(order);
                if (order.quantity() < 0)
                    _this.invalidOrderCount(_this.invalidOrderCount() - 1);
                _this.totalNumber(Number(_this.totalNumber()) - Number(order.quantity()));
                _this.totalPrice(Number(_this.totalPrice()) - Number(order.total()));
            };
            _this.cancelOrders = function () {
                _this.orders([]);
                _this.totalNumber(0);
                _this.totalPrice(0);
                _this.batchId = null;
                _this.cancelOrderAdding();
                _this.invalidOrderCount(0);
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