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
define(["require", "exports", "./PageBase", "../Navigator", "./Consts", "../Models/Product", "../Repositories/ProductRepository", "../Repositories/OrderRepository", "../Models/Order", "../Utils", "../Models/Order"], function (require, exports, PageBase_1, Navigator_1, Consts, Product_1, ProductRepository_1, OrderRepository_1, Order_1, Utils, Order_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Retail = (function (_super) {
        __extends(Retail, _super);
        function Retail() {
            var _this = _super.call(this) || this;
            _this.navigator = Navigator_1.Navigator.instance;
            _this.products = ko.observableArray([]);
            _this.dict = {};
            _this.selectOptions = { Id: "placeholder", Name: "选择产品……", RetailPrice: 0, RetailUnitName: '' };
            _this.selectedProductId = ko.observable(_this.selectOptions.Id);
            _this.selectedProduct = ko.observable(_this.selectOptions);
            _this.productSelected = ko.computed(function () {
                if (_this.selectedProduct() && _this.selectedProduct().Id !== _this.selectOptions.Id)
                    return true;
                return false;
            });
            _this.selectedProductQuantity = ko.observable(1);
            _this.clearSelection = ko.observable(false);
            _this.retailOrders = ko.observableArray([]);
            _this.batchId = null;
            _this.totalNumber = ko.observable(0);
            _this.totalPrice = ko.observable(0);
            _this.productRepository = new ProductRepository_1.ProductRepository();
            _this.orderRepository = new OrderRepository_1.OrderRepository();
            _this.addOrder = function () {
                //Add Product
                if (_this.batchId == null)
                    _this.batchId = Utils.guid();
                var isNew = true;
                for (var i = 0; i < _this.retailOrders().length; i++) {
                    if (_this.retailOrders()[i].product().Id === _this.selectedProduct().Id) {
                        // order.total is a ko.computed observable, so, when quantity changed, the total will be updated automatically
                        _this.retailOrders()[i].quantity(_this.retailOrders()[i].quantity() + _this.selectedProductQuantity());
                        _this.totalPrice(_this.totalPrice() + _this.selectedProductQuantity() * _this.selectedProduct().RetailPrice);
                        isNew = false;
                        break;
                    }
                }
                if (isNew) {
                    var order = new Order_1.Order(Utils.guid(), _this.batchId, _this.selectedProduct(), Order_2.OrderTypes.Import, _this.selectedProductQuantity(), _this.selectedProduct().RetailPrice);
                    _this.retailOrders.push(order);
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
                _this.retailOrders.remove(order);
                _this.totalNumber(_this.totalNumber() - order.quantity());
                _this.totalPrice(_this.totalPrice() - order.total());
            };
            _this.cancelOrders = function () {
                _this.retailOrders([]);
                _this.totalNumber(0);
                _this.totalPrice(0);
                _this.batchId = null;
                _this.cancelOrderAdding();
            };
            _this.save = function () {
                var _loop_1 = function (i) {
                    var order = _this.retailOrders()[i];
                    order.createdDate = new Date(Date.now());
                    order.modifiedDate = order.createdDate;
                    var product = order.product();
                    product.Inventory -= (order.quantity() * 1);
                    product.CreatedDate = new Date(product.CreatedDate);
                    product.ModifiedDate = new Date(Date.now());
                    _this.orderRepository.insert(order, function (transaction, resultSet) {
                        _this.productRepository.update(product, function (transaction, resultSet) {
                        }, function (transaction, sqlError) {
                            alert("Faield to update Product: " + product.Id + '\r\n' + sqlError.message);
                        });
                    }, function (transaction, sqlError) {
                        alert("Faield to inser new Order: " + order.id() + '\r\n' + sqlError.message);
                    });
                };
                for (var i = 0; i < _this.retailOrders().length; i++) {
                    _loop_1(i);
                }
                _this.cancelOrders();
                _this.navigator.showConfirmDialog("零售", "已成功生成订单。", false, true, null, null, null, '好');
            };
            _this.onDBError = function (transaction, sqlError) {
                alert("Retail Page: " + sqlError.message);
            };
            _this.title = ko.observable("零售");
            _this.pageId = Consts.Pages.Retail.Id;
            _this.back = Navigator_1.Navigator.instance.goHome;
            _this.selectedProductId.subscribe(function (newValue) {
                _this.selectedProduct(_this.dict[newValue]);
            });
            return _this;
        }
        Retail.prototype.initialize = function () {
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
        return Retail;
    }(PageBase_1.PageBase));
    exports.Retail = Retail;
});
//# sourceMappingURL=Retail.js.map