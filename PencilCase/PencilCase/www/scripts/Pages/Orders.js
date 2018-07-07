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
    var Orders = (function (_super) {
        __extends(Orders, _super);
        function Orders() {
            var _this = _super.call(this) || this;
            _this.navigator = Navigator_1.Navigator.instance;
            _this.batchOrders = ko.observableArray([]);
            _this.showDetails = function (batchOrder) {
                _this.navigator.navigateTo(Consts.Pages.BathOrderDetails, {
                    data: {
                        parameters: {
                            batchOrder: batchOrder
                        }
                    },
                    changeHash: true
                });
            };
            _this.onDBError = function (transaction, sqlError) {
                alert("Order Management Page: " + sqlError.message);
            };
            _this.title = ko.observable("Orders Management");
            _this.pageId = Consts.Pages.OrderManagement.Id;
            _this.back = Navigator_1.Navigator.instance.goHome;
            return _this;
        }
        Orders.prototype.initialize = function () {
            var _this = this;
            var orderRepository = new OrderRepository_1.OrderRepository();
            orderRepository.getBatchOrders(function (transaction, resultSet) {
                _this.batchOrders([]); // First, clear products collection
                var rows = resultSet.rows;
                for (var i = 0; i < rows.length; i++) {
                    _this.batchOrders.push({
                        BatchId: rows[i].BatchId,
                        Type: rows[i].Type,
                        Quantity: rows[i].Quantity,
                        Total: rows[i].Total,
                        CreatedDate: rows[i].CreatedDate
                    });
                }
            }, this.onDBError);
        };
        Orders.prototype.getTypeName = function (type) {
            switch (type) {
                case Order_1.OrderTypes.Import:
                    return "进货";
                case Order_1.OrderTypes.Retail:
                    return "零售";
                case Order_1.OrderTypes.Wholesale:
                    return "批发";
                case Order_1.OrderTypes.RetailWholesale:
                    return "零批";
            }
        };
        return Orders;
    }(PageBase_1.PageBase));
    exports.Orders = Orders;
});
//# sourceMappingURL=Orders.js.map