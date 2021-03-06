define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Order = (function () {
        function Order(id, batchId, product, type, quantity, price) {
            var _this = this;
            this.id = ko.observable(id);
            this.batchId = ko.observable(batchId);
            this.productId = ko.observable(product.Id);
            this.product = ko.observable(product);
            this.type = ko.observable(type);
            switch (type) {
                case OrderTypes.Retail:
                    this.price = ko.observable(price == undefined ? product.RetailPrice : price);
                    this.unitId = ko.observable(product.RetailUnit);
                    this.unitName = ko.observable(product.RetailUnitName);
                    break;
                case OrderTypes.RetailWholesale:
                    this.price = ko.observable(price == undefined ? product.RetailWholesalePrice : price);
                    this.unitId = ko.observable(product.RetailUnit);
                    this.unitName = ko.observable(product.RetailUnitName);
                    break;
                case OrderTypes.Wholesale:
                    this.price = ko.observable(price == undefined ? product.WholesalePrice : price);
                    this.unitId = ko.observable(product.WholesaleUnit);
                    this.unitName = ko.observable(product.WholesaleUnitName);
                    break;
                case OrderTypes.Import:
                    this.price = ko.observable(price ? price : 0);
                    this.unitId = ko.observable(product.RetailUnit);
                    this.unitName = ko.observable(product.RetailUnitName);
                    break;
            }
            this.quantity = ko.observable(quantity);
            this.total = ko.computed(function () {
                // JS的小数计算精度问题
                //	https://www.cnblogs.com/weiqt/articles/2642393.html
                //  https://blog.csdn.net/liaodehong/article/details/51558292
                return _this.price() * 10000 * _this.quantity() / 10000;
            });
            this.createdDate = new Date(Date.now());
            this.modifiedDate = new Date(Date.now());
        }
        return Order;
    }());
    exports.Order = Order;
    var OrderTypes;
    (function (OrderTypes) {
        OrderTypes[OrderTypes["Retail"] = 1] = "Retail";
        OrderTypes[OrderTypes["Wholesale"] = 2] = "Wholesale";
        OrderTypes[OrderTypes["Import"] = 3] = "Import";
        OrderTypes[OrderTypes["RetailWholesale"] = 4] = "RetailWholesale"; //4
    })(OrderTypes = exports.OrderTypes || (exports.OrderTypes = {}));
});
//# sourceMappingURL=Order.js.map