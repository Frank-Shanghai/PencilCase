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
define(["require", "exports", "./DealPageBase", "./Consts"], function (require, exports, DealPageBase_1, Consts) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var ImportProduct = (function (_super) {
        __extends(ImportProduct, _super);
        function ImportProduct() {
            var _this = _super.call(this) || this;
            _this.selectedProductImportPrice = ko.observable(0);
            _this.addOrder = function () {
                _this.addOrderWithSpecifiedPrice(_this.selectedProductImportPrice());
            };
            _this.save = function () {
                var _loop_1 = function (i) {
                    var order = _this.orders()[i];
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
                for (var i = 0; i < _this.orders().length; i++) {
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
            _this.onSelectionChanged = function (newValue) {
                _this.selectedProduct(_this.dict[newValue]);
                if (_this.selectedProduct() && _this.selectedProduct().Id !== _this.selectOptions.Id) {
                    _this.selectedProductImportPrice(_this.selectedProduct().ImportWholesalePrice ? _this.selectedProduct().ImportWholesalePrice : 0);
                }
            };
            _this.selectedProductId.subscribe(_this.onSelectionChanged);
            return _this;
        }
        return ImportProduct;
    }(DealPageBase_1.DealPageBase));
    exports.ImportProduct = ImportProduct;
});
//# sourceMappingURL=ImportProduct.js.map