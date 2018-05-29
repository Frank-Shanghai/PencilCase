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
define(["require", "exports", "./PageBase", "../Navigator", "./Consts", "../Models/Order", "../Repositories/OrderRepository"], function (require, exports, PageBase_1, Navigator_1, Consts, Order_1, OrderRepository_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var BatchOrderDetails = (function (_super) {
        __extends(BatchOrderDetails, _super);
        function BatchOrderDetails(parameters) {
            var _this = _super.call(this) || this;
            _this.parameters = parameters;
            _this.navigator = Navigator_1.Navigator.instance;
            _this.orders = ko.observableArray([]);
            _this.onDBError = function (transaction, sqlError) {
                alert("Batch Order Details Page: " + sqlError.message);
            };
            _this.title = ko.observable("Order Details");
            _this.pageId = Consts.Pages.BathOrderDetails.Id;
            _this.back = function () {
                _this.navigator.navigateTo(Consts.Pages.OrderManagement, {
                    changeHash: true,
                });
            };
            return _this;
        }
        BatchOrderDetails.prototype.initialize = function () {
            var _this = this;
            var orderRepository = new OrderRepository_1.OrderRepository();
            orderRepository.getOrdersByBatchId(this.parameters.batchOrder.Id, function (transaction, resultSet) {
                _this.orders([]); // First, clear products collection
                var rows = resultSet.rows;
                for (var i = 0; i < rows.length; i++) {
                    _this.orders.push(rows[i]);
                }
            }, this.onDBError);
        };
        BatchOrderDetails.prototype.getTypeName = function (type) {
            switch (type) {
                case Order_1.OrderTypes.Import:
                    return "进货";
                case Order_1.OrderTypes.Retail:
                    return "零售";
                case Order_1.OrderTypes.Wholesale:
                    return "批发";
            }
        };
        return BatchOrderDetails;
    }(PageBase_1.PageBase));
    exports.BatchOrderDetails = BatchOrderDetails;
});
//# sourceMappingURL=BatchOrderDetails.js.map