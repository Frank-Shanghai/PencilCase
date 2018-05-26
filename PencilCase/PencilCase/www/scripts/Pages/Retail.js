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
    var Retail = (function (_super) {
        __extends(Retail, _super);
        function Retail() {
            var _this = _super.call(this) || this;
            _this.addOrder = function () {
                _this.addOrderWithSpecifiedPrice(_this.selectedProduct().RetailPrice);
            };
            _this.save = function () {
                var _loop_1 = function (i) {
                    var order = _this.orders()[i];
                    order.createdDate = new Date(Date.now());
                    order.modifiedDate = order.createdDate;
                    var product = order.product();
                    _this.orderRepository.insert(order, function (transaction, resultSet) {
                        _this.productRepository.updateWithFieldValues([
                            { Field: "Inventory", Type: "number", Value: "Inventory - " + order.quantity() }
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
                _this.cancelOrders();
                _this.navigator.showConfirmDialog("零售", "已成功生成订单。", false, true, null, null, null, '好');
            };
            _this.onDBError = function (transaction, sqlError) {
                alert("Retail Page: " + sqlError.message);
            };
            _this.title = ko.observable("零售");
            _this.pageId = Consts.Pages.Retail.Id;
            _this.onSelectionChanged = function (newValue) {
                _this.selectedProduct(_this.dict[newValue]);
            };
            _this.selectedProductId.subscribe(_this.onSelectionChanged);
            return _this;
        }
        return Retail;
    }(DealPageBase_1.DealPageBase));
    exports.Retail = Retail;
});
//# sourceMappingURL=Retail.js.map