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
define(["require", "exports", "./PageBase", "../Navigator", "./Consts"], function (require, exports, PageBase_1, Navigator_1, Consts) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var ProductManagement = (function (_super) {
        __extends(ProductManagement, _super);
        function ProductManagement() {
            var _this = _super.call(this) || this;
            _this.navigator = Navigator_1.Navigator.instance;
            _this.products = ko.observableArray([]);
            _this.addNewProduct = function () {
                //this.navigator.navigateTo($("div#ProductEditor").first(), {
                //    data: {
                //        pageInfo: Consts.Pages.ProductEditor,
                //        //selectedProduct: null or one product instance
                //    }
                //});
                var first = _this.products()[0];
                _this.products.push(first);
            };
            _this.showDetails = function (product) {
                _this.navigator.navigateTo(Consts.Pages.ProductEditor, {
                    data: {
                        parameters: {
                            product: product
                        }
                    },
                    changeHash: false
                });
            };
            _this.onDBError = function (transaction, sqlError) {
                alert(sqlError.message);
            };
            _this.title = ko.observable("Product Management");
            _this.pageId = Consts.Pages.ProductManagement.Id;
            return _this;
        }
        ProductManagement.prototype.initialize = function () {
            var _this = this;
            var db = window.openDatabase("PencilCase", "0.1", "Pencil Case", 2 * 1024 * 1024);
            if (db) {
                db.transaction(function (transaction) {
                    transaction.executeSql('select P.*, UOM1.Name RetailUnitName, UOM2.Name WholesaleUnitName from Product P \
                                        join UnitOfMeasure UOM1 on P.RetailUnit = UOM1.Id \
                                        join UnitOfMeasure UOM2 on P.WholesaleUnit = UOM2.Id', [], function (transaction, resultSet) {
                        _this.products([]); // First, clear products collection
                        var rows = resultSet.rows;
                        for (var i = 0; i < rows.length; i++) {
                            _this.products.push(rows.item(i));
                        }
                    }, _this.onDBError);
                });
            }
        };
        return ProductManagement;
    }(PageBase_1.PageBase));
    exports.ProductManagement = ProductManagement;
});
//# sourceMappingURL=ProductManagement.js.map