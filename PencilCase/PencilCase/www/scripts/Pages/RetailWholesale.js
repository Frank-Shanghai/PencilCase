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
define(["require", "exports", "./DealPageBase", "./Consts", "../Models/Order", "../application"], function (require, exports, DealPageBase_1, Consts, Order_1, application_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var RetailWholesale = (function (_super) {
        __extends(RetailWholesale, _super);
        function RetailWholesale() {
            var _this = _super.call(this) || this;
            _this.addOrder = function () {
                _this.addOrderWithSpecifiedPrice(_this.selectedProduct().RetailWholesalePrice, Order_1.OrderTypes.RetailWholesale);
            };
            _this.save = function () {
                var sqlStatements = [];
                // Make sure the orders in this batch have the same created date, it's necessary for grouping purpose
                var createdDate = new Date(Date.now());
                for (var i = 0; i < _this.orders().length; i++) {
                    var order = _this.orders()[i];
                    order.createdDate = createdDate;
                    order.modifiedDate = order.createdDate;
                    var product = order.product();
                    sqlStatements.push(_this.orderRepository.insertSqlStatement(order));
                    sqlStatements.push(_this.productRepository.updateWithFieldValuesSqlStatement([
                        { Field: "Inventory", Type: "number", Value: "Inventory - " + order.quantity() }
                    ], product.Id));
                }
                var db = application_1.Application.instance.openDataBase();
                db.transaction(function (transaction) {
                    for (var i = 0; i < sqlStatements.length; i++) {
                        // if you handled the exception when executing sql, it won't throw it up to parent level, which mean 
                        // the error handler for db.transaction(..., ..., ...) won't be called, BUT the success call back will be called
                        // So, to avoid the confusing issue mentioned above, DO NOT handle the transaction.executeSql exception, 
                        // leave it to be handled by parent level, and everything will be rolled back
                        //transaction.executeSql(sqlStatements[i], [], null, this.onDBError);
                        transaction.executeSql(sqlStatements[i]);
                    }
                }, function (error) {
                    _this.onDBError(null, error);
                }, function () {
                    _this.cancelOrders();
                    _this.navigator.showConfirmDialog("零批", "已成功生成订单。", false, true, null, null, null, '好');
                });
            };
            _this.onDBError = function (transaction, sqlError) {
                if (transaction == null) {
                    alert("Retail Wholesale Page: Error happened, failed to complete the operation, all data is rolled back." + sqlError.message);
                }
                else {
                    alert("Retail Wholesale Page: " + sqlError.message);
                }
            };
            _this.title = ko.observable("零批");
            _this.pageId = Consts.Pages.RetailWholesale.Id;
            _this.onSelectionChanged = function (newValue) {
                _this.selectedProduct(_this.dict[newValue]);
            };
            _this.selectedProductId.subscribe(_this.onSelectionChanged);
            return _this;
        }
        return RetailWholesale;
    }(DealPageBase_1.DealPageBase));
    exports.RetailWholesale = RetailWholesale;
});
//# sourceMappingURL=RetailWholesale.js.map