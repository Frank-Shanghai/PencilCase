define(["require", "exports", "../application"], function (require, exports, application_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var OrderRepository = (function () {
        function OrderRepository() {
            var _this = this;
            this.insertSqlStatement = function (order) {
                var sqlString = "insert into Orders values ('" + ko.unwrap(order.id) + "','" + ko.unwrap(order.batchId) + "','" + ko.unwrap(order.productId) + "'," + ko.unwrap(order.type) + ",'" + ko.unwrap(order.unitId) + "'," +
                    ko.unwrap(order.price) + "," + ko.unwrap(order.quantity) + "," + ko.unwrap(order.total) + ",'" +
                    moment(order.createdDate.toISOString()).format("YYYY-MM-DD hh:mm:ss") + "','" + moment(order.modifiedDate.toISOString()).format("YYYY-MM-DD hh:mm:ss") + "')";
                return sqlString;
            };
            this.insert = function (order, successCallback, errorCallback) {
                var sqlString = _this.insertSqlStatement(order);
                _this.db.transaction(function (transaction) {
                    transaction.executeSql(sqlString, [], successCallback, errorCallback);
                });
            };
            this.getBatchOrders = function (successCallback, errorCallback) {
                var sqlString = "select BatchId, Type, Sum(Quantity) as Quantity, Sum(Total) as Total, CreatedDate from Orders group by BatchId, Type, CreatedDate";
                _this.db.transaction(function (transaction) {
                    transaction.executeSql(sqlString, [], successCallback, errorCallback);
                });
            };
            this.db = application_1.Application.instance.openDataBase();
        }
        return OrderRepository;
    }());
    exports.OrderRepository = OrderRepository;
});
//# sourceMappingURL=OrderRepository.js.map