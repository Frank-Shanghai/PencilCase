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
define(["require", "exports", "./DealPageBase", "./Consts", "../application"], function (require, exports, DealPageBase_1, Consts, application_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Wholesale = (function (_super) {
        __extends(Wholesale, _super);
        function Wholesale() {
            var _this = _super.call(this) || this;
            _this.addOrder = function () {
                _this.addOrderWithSpecifiedPrice(_this.selectedProduct().WholesalePrice);
            };
            _this.save = function () {
                var sqlStatements = [];
                for (var i = 0; i < _this.orders().length; i++) {
                    var order = _this.orders()[i];
                    order.createdDate = new Date(Date.now());
                    order.modifiedDate = order.createdDate;
                    var product = order.product();
                    sqlStatements.push(_this.orderRepository.insertSqlStatement(order));
                    sqlStatements.push(_this.productRepository.updateWithFieldValuesSqlStatement([
                        { Field: "Inventory", Type: "number", Value: "Inventory - " + (order.quantity() * product.Times) }
                    ], product.Id));
                }
                var db = application_1.Application.instance.openDataBase();
                db.transaction(function (transaction) {
                    for (var i = 0; i < sqlStatements.length; i++) {
                        transaction.executeSql(sqlStatements[i], [], null, _this.onDBError);
                    }
                }, function (error) {
                    _this.onDBError(null, error);
                }, function () {
                    _this.cancelOrders();
                    _this.navigator.showConfirmDialog("批发", "已成功生成订单。", false, true, null, null, null, '好');
                });
            };
            _this.onDBError = function (transaction, sqlError) {
                if (transaction == null) {
                    alert("Wholesale Page: Error happened, failed to complete the operation, all data is rolled back." + sqlError.message);
                }
                else {
                    alert("Wholesale Page: " + sqlError.message);
                }
            };
            _this.title = ko.observable("批发");
            _this.pageId = Consts.Pages.Whosale.Id;
            _this.onSelectionChanged = function (newValue) {
                _this.selectedProduct(_this.dict[newValue]);
            };
            _this.selectedProductId.subscribe(_this.onSelectionChanged);
            return _this;
        }
        return Wholesale;
    }(DealPageBase_1.DealPageBase));
    exports.Wholesale = Wholesale;
});
//# sourceMappingURL=Wholesale.js.map