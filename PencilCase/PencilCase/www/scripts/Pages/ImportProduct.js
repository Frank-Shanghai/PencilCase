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
            _this.selectedProductImportPrice = ko.observable(0);
            _this.clearSelection = ko.observable(false);
            _this.importOrders = ko.observableArray([]);
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
                for (var i = 0; i < _this.importOrders().length; i++) {
                    if (_this.importOrders()[i].product().Id === _this.selectedProduct().Id && _this.importOrders()[i].price() == _this.selectedProductImportPrice()) {
                        _this.importOrders()[i].quantity(_this.importOrders()[i].quantity() + _this.selectedProductQuantity());
                        _this.totalPrice(_this.totalPrice() + _this.selectedProductQuantity() * _this.selectedProductImportPrice());
                        isNew = false;
                        break;
                    }
                }
                if (isNew) {
                    var order = new Order_1.Order(Utils.guid(), _this.batchId, _this.selectedProduct(), Order_2.OrderTypes.Import, _this.selectedProductQuantity(), _this.selectedProductImportPrice());
                    _this.importOrders.push(order);
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
                _this.importOrders.remove(order);
                _this.totalNumber(_this.totalNumber() - order.quantity());
                _this.totalPrice(_this.totalPrice() - order.total());
            };
            _this.cancelOrders = function () {
                _this.importOrders([]);
                _this.totalNumber(0);
                _this.totalPrice(0);
                _this.batchId = null;
                _this.cancelOrderAdding();
            };
            _this.save = function () {
                var _loop_1 = function (i) {
                    var order = _this.importOrders()[i];
                    order.createdDate = new Date(Date.now());
                    order.modifiedDate = order.createdDate;
                    var product = order.product();
                    var newRetailCost = ((product.RetailCost * product.Inventory) + (order.price() * order.quantity())) / (product.Inventory + order.quantity() * product.Times);
                    var newWholesaleCost = newRetailCost * product.Times;
                    _this.orderRepository.insert(order, function (transaction, resultSet) {
                        _this.productRepository.updateWithFieldValues([
                            { Field: "Inventory", Type: "number", Value: "Inventory + " + (order.quantity() * product.Times) },
                            { Field: "RetailCost", Type: "number", Value: newRetailCost },
                            { Field: "WholesaleCost", Type: "number", Value: newWholesaleCost },
                            { Field: "ImportWholesalePrice", Type: "number", Value: order.price() },
                            { Field: "ImportRetailPrice", Type: "number", Value: product.ImportWholesalePrice / product.Times },
                        ], product.Id, function (transaction, resultSet) {
                        }, function (transaction, sqlError) {
                            alert("Faield to update Product: " + product.Id + '\r\n' + sqlError.message);
                        });
                    }, function (transaction, sqlError) {
                        alert("Faield to inser new Order: " + order.id() + '\r\n' + sqlError.message);
                    });
                };
                for (var i = 0; i < _this.importOrders().length; i++) {
                    _loop_1(i);
                }
                // 上面的数据库操作是异步处理，所以即使有插入错误，这里也会被调用。有后续PBI解决这个问题。
                // 整个订单插入，库存修改应做成事务处理。
                // 所以这里的批处理情况不适用于使用repository. 可以让repository 返回组合成的sql 语句，然后在这里用一个事务处理。
                _this.cancelOrders();
                _this.navigator.showConfirmDialog("进货", "已添加成功。", false, true, null, null, null, '好');
            };
            _this.onDBError = function (transaction, sqlError) {
                alert("Import Product Page: " + sqlError.message);
            };
            _this.title = ko.observable("进货");
            _this.pageId = Consts.Pages.ImportProduct.Id;
            _this.back = Navigator_1.Navigator.instance.goHome;
            _this.selectedProductId.subscribe(function (newValue) {
                _this.selectedProduct(_this.dict[newValue]);
                if (_this.selectedProduct() && _this.selectedProduct().Id !== _this.selectOptions.Id) {
                    _this.selectedProductImportPrice(_this.selectedProduct().ImportWholesalePrice ? _this.selectedProduct().ImportWholesalePrice : 0);
                }
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