define(["require", "exports", "../application"], function (require, exports, application_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var ProductRepository = (function () {
        function ProductRepository() {
            var _this = this;
            this.getAll = function (successCallback, errorCallback) {
                _this.db.transaction(function (transaction) {
                    transaction.executeSql('select P.*, UOM1.Name RetailUnitName, UOM2.Name WholesaleUnitName from Product P \
                                        join UnitOfMeasure UOM1 on P.RetailUnit = UOM1.Id \
                                        join UnitOfMeasure UOM2 on P.WholesaleUnit = UOM2.Id', [], successCallback, errorCallback);
                });
            };
            this.update = function (product, successCallback, errorCallback) {
                var sqlString = "update Product set Name = '" + product.Name + "', Description = '" + product.Description + "', RetailPrice = " + product.RetailPrice + ", RetailUnit = '" + product.RetailUnit + "', WholesalePrice = " +
                    product.WholesalePrice + ", WholesaleUnit = '" + product.WholesaleUnit + "', ImportWholesalePrice = " + product.ImportWholesalePrice + ", ImportRetailPrice = " + product.ImportRetailPrice + ", WholesaleCost = " + product.WholesaleCost + ", RetailCost = " + product.RetailCost + ", Times = " + product.Times + ", Inventory = " + product.Inventory + ", Image = '" + product.Image + "', ModifiedDate = '" +
                    moment(product.ModifiedDate.toISOString()).format("YYYY-MM-DD") + "' where Id = '" + product.Id + "'";
                _this.db.transaction(function (transaction) {
                    transaction.executeSql(sqlString, [], successCallback, errorCallback);
                });
            };
            this.updateWithFieldValues = function (keyValuePairs, productId, successCallback, errorCallback) {
                if (keyValuePairs.length == 0)
                    return;
                var sqlString = "update Product set ";
                var fieldValues = '';
                for (var i = 0; i < keyValuePairs.length; i++) {
                    switch (keyValuePairs[i].Type) {
                        case "string":
                        case "date":
                            fieldValues = ' ' + keyValuePairs[i].Field + " = '" + keyValuePairs[i].Value + "',";
                            sqlString += fieldValues;
                            break;
                        case "number":
                            fieldValues = ' ' + keyValuePairs[i].Field + " = " + keyValuePairs[i].Value + ",";
                            sqlString += fieldValues;
                            break;
                    }
                }
                //http://www.w3school.com.cn/jsref/jsref_substring.asp, explains why the secondn parameter is sqlString.length - 1
                //sqlString = sqlString.substring(0, sqlString.length - 2);
                sqlString = sqlString.substring(0, sqlString.length - 1);
                sqlString += " where Id = '" + productId + "'";
                _this.db.transaction(function (transaction) {
                    transaction.executeSql(sqlString, [], successCallback, errorCallback);
                });
            };
            this.insert = function (product, successCallback, errorCallback) {
                var sqlString = "insert into Product values ('" + product.Id + "','" + product.Name + "','" + product.Description + "'," + product.RetailPrice + ",'" + product.RetailUnit + "'," +
                    product.WholesalePrice + ",'" + product.WholesaleUnit + "'," + product.ImportWholesalePrice + "," + product.ImportRetailPrice + "," + product.WholesaleCost + "," + product.RetailCost + "," + product.Times + "," + product.Inventory + ",'" + product.Image + "','" +
                    moment(product.CreatedDate.toISOString()).format("YYYY-MM-DD") + "','" + moment(product.ModifiedDate.toISOString()).format("YYYY-MM-DD") + "')";
                _this.db.transaction(function (transaction) {
                    transaction.executeSql(sqlString, [], successCallback, errorCallback);
                });
            };
            this.getProductById = function (id, successCallback, errorCallback) {
                _this.db.transaction(function (transaction) {
                    transaction.executeSql("select P.*, UOM1.Name RetailUnitName, UOM2.Name WholesaleUnitName from Product P \
                                                join UnitOfMeasure UOM1 on P.RetailUnit = UOM1.Id\
                                                join UnitOfMeasure UOM2 on P.WholesaleUnit = UOM2.Id\
                                                where P.Id = '" + id + "'", [], successCallback, errorCallback);
                });
            };
            this.getProductByRowId = function (rowId, successCallback, errorCallback) {
                _this.db.transaction(function (transaction) {
                    transaction.executeSql("select P.*, UOM1.Name RetailUnitName, UOM2.Name WholesaleUnitName from Product P \
                                                join UnitOfMeasure UOM1 on P.RetailUnit = UOM1.Id\
                                                join UnitOfMeasure UOM2 on P.WholesaleUnit = UOM2.Id\
                                                where P.rowid = " + rowId, [], successCallback, errorCallback);
                });
            };
            this.delete = function (id, successCallback, errorCallback) {
                _this.db.transaction(function (transaction) {
                    transaction.executeSql("delete from Product where Id = '" + id + "'", [], successCallback, errorCallback);
                });
            };
            this.db = application_1.Application.instance.openDataBase();
        }
        return ProductRepository;
    }());
    exports.ProductRepository = ProductRepository;
});
//# sourceMappingURL=ProductRepository.js.map