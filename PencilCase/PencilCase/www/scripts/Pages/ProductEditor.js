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
define(["require", "exports", "./PageBase", "../Navigator", "../Utils", "./Consts"], function (require, exports, PageBase_1, Navigator_1, Utils, Consts) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var ProductEditor = (function (_super) {
        __extends(ProductEditor, _super);
        function ProductEditor(parameters) {
            var _this = _super.call(this) || this;
            _this.parameters = parameters;
            _this.navigator = Navigator_1.Navigator.instance;
            _this.isInEditingMode = ko.observable(false);
            _this.originalProduct = ko.observable(null);
            _this.uomDataSource = ko.observableArray([]);
            _this.name = ko.observable('');
            _this.description = ko.observable('');
            _this.inventory = ko.observable(0);
            _this.retailPrice = ko.observable(0);
            _this.retailUnit = ko.observable(null);
            _this.wholesaleUnit = ko.observable(null);
            _this.times = ko.observable(undefined);
            _this.wholesalePrice = ko.observable(undefined);
            _this.importWholesalePrice = ko.observable(undefined);
            _this.isNewProduct = false;
            _this.startEditing = function () {
                _this.isInEditingMode(true);
                _this.reSetEditingFields();
            };
            _this.reSetEditingFields = function () {
                _this.name(_this.parameters.product.Name);
                _this.description(_this.parameters.product.Description);
                _this.inventory(_this.parameters.product.Inventory);
                _this.retailPrice(_this.parameters.product.RetailPrice);
                _this.times(_this.parameters.product.Times);
                _this.retailUnit(_this.parameters.product.RetailUnit);
                _this.wholesaleUnit(_this.parameters.product.WholesaleUnit);
                _this.wholesalePrice(_this.parameters.product.WholesalePrice);
                _this.importWholesalePrice(_this.parameters.product.ImportWholesalePrice);
            };
            // 方法名不能是delete，否则前台绑定后，有奇怪的错误，viewmodel识别不了。
            // 花了1小时发现的问题，难道是某种豫留关键字或什么东西。
            _this.deleteProduct = function () {
                alert("Not implemented yet.");
            };
            _this.save = function () {
                var db = window.openDatabase("PencilCase", "0.1", "Pencil Case", 2 * 1024 * 1024);
                if (db) {
                    var guid_1 = null;
                    if (_this.isNewProduct === true) {
                        guid_1 = Utils.guid();
                    }
                    else {
                        guid_1 = _this.parameters.product.Id;
                    }
                    var name_1 = _this.name();
                    var description_1 = _this.description();
                    var retailPrice_1 = _this.retailPrice();
                    var retailUnit_1 = _this.retailUnit();
                    var wholesalePrice_1 = _this.wholesalePrice();
                    var wholesaleUnit_1 = _this.wholesaleUnit();
                    var importWholesalePrice_1 = _this.importWholesalePrice(); // TODO: May set as not editable but calculate the actual value everytime when importing products
                    var importRetailPrice_1 = _this.importWholesalePrice() / _this.times();
                    var times_1 = _this.times();
                    var inventory_1 = _this.inventory();
                    var image_1 = '暂不可用';
                    var modifiedDate_1 = new Date(Date.now());
                    if (_this.isNewProduct == true) {
                        var sqlString_1 = "insert into Product values ('" + guid_1 + "','" + name_1 + "','" + description_1 + "'," + retailPrice_1 + ",'" + retailUnit_1 + "'," +
                            wholesalePrice_1 + ",'" + wholesaleUnit_1 + "'," + importWholesalePrice_1 + "," + importRetailPrice_1 + "," + times_1 + "," + inventory_1 + ",'" + image_1 + "','" +
                            moment(modifiedDate_1.toISOString()).format("YYYY-MM-DD") + "','" + moment(modifiedDate_1.toISOString()).format("YYYY-MM-DD") + "')";
                        db.transaction(function (transaction) {
                            transaction.executeSql(sqlString_1, [], function (transaction, resultSet) {
                                transaction.executeSql("select P.*, UOM1.Name RetailUnitName, UOM2.Name WholesaleUnitName from Product P \
                                                join UnitOfMeasure UOM1 on P.RetailUnit = UOM1.Id\
                                                join UnitOfMeasure UOM2 on P.WholesaleUnit = UOM2.Id\
                                                where P.rowid = " + resultSet.insertId, [], function (trans, results) {
                                    _this.originalProduct(results.rows.item(0));
                                    _this.isInEditingMode(false);
                                    _this.isNewProduct = false;
                                }, _this.onDBError);
                            }, _this.onDBError);
                        });
                    }
                    else {
                        db.transaction(function (transaction) {
                            var sqlString = "update Product set Name = '" + name_1 + "', Description = '" + description_1 + "', RetailPrice = " + retailPrice_1 + ", RetailUnit = '" + retailUnit_1 + "', WholesalePrice = " +
                                wholesalePrice_1 + ", WholesaleUnit = '" + wholesaleUnit_1 + "', ImportWholesalePrice = " + importWholesalePrice_1 + ", ImportRetailPrice = " + importRetailPrice_1 + ", Times = " + times_1 + ", Inventory = " + inventory_1 + ", Image = '" + image_1 + "', ModifiedDate = '" +
                                moment(modifiedDate_1.toISOString()).format("YYYY-MM-DD") + "' where Id = '" + guid_1 + "'";
                            transaction.executeSql(sqlString, [], function (transaction, resultSet) {
                                transaction.executeSql("select P.*, UOM1.Name RetailUnitName, UOM2.Name WholesaleUnitName from Product P \
                                                    join UnitOfMeasure UOM1 on P.RetailUnit = UOM1.Id\
                                                    join UnitOfMeasure UOM2 on P.WholesaleUnit = UOM2.Id\
                                                    where P.Id = '" + guid_1 + "'", [], function (trans, results) {
                                    _this.originalProduct(results.rows.item(0));
                                    _this.isInEditingMode(false);
                                }, _this.onDBError);
                            }, _this.onDBError);
                        });
                    }
                }
            };
            _this.cancel = function () {
                if (_this.isNewProduct == true) {
                    _this.goBack();
                }
                else {
                    _this.isInEditingMode(false);
                }
            };
            _this.goBack = function () {
                _this.navigator.navigateTo(Consts.Pages.ProductManagement, {
                    changeHash: false,
                    dataUrl: "ProdutManagement"
                });
            };
            _this.onDBError = function (transaction, sqlError) {
                alert(sqlError.message);
            };
            _this.title = ko.observable("Product Editor");
            _this.pageId = Consts.Pages.ProductEditor.Id;
            _this.isNotInEditingMode = ko.computed(function () {
                return !_this.isInEditingMode();
            });
            if (parameters && parameters.product) {
                _this.originalProduct(parameters.product);
            }
            else {
                if (parameters.product == null) {
                    // Adding a new product
                    // To avoid refreshing the content view, initialize the originalProduct as an empty product with requested fields
                    // KO if works, but lost Jquery enhancement when DOM re-created, and KO visible binding just didn't remove DOM but make them invisible, so the binding behind still works,
                    // and it will fail because of binding to fields of null (orginalProduct is null when adding new product)
                    // So here I didn't use KO if, but set orginalProduct as an empty entity, in this way, KO visible binding works
                    _this.originalProduct(_this.createEmptyProduct());
                    _this.isInEditingMode(true);
                    _this.isNewProduct = true;
                }
            }
            return _this;
        }
        ProductEditor.prototype.initialize = function () {
            var _this = this;
            var db = window.openDatabase("PencilCase", "0.1", "Pencil Case", 2 * 1024 * 1024);
            if (db) {
                db.transaction(function (transaction) {
                    transaction.executeSql('select * from UnitOfMeasure', [], function (transaction, resultSet) {
                        for (var i = 0; i < resultSet.rows.length; i++) {
                            _this.uomDataSource.push(resultSet.rows.item(i));
                        }
                        if (_this.parameters.product) {
                            _this.retailUnit(_this.parameters.product.RetailUnit);
                            _this.wholesaleUnit(_this.parameters.product.WholesaleUnit);
                        }
                        else {
                            _this.retailUnit(null);
                            _this.wholesaleUnit(null);
                        }
                    }, _this.onDBError);
                });
            }
        };
        ProductEditor.prototype.createEmptyProduct = function () {
            return {
                Name: '',
                Description: '',
                Inventory: 0,
                RetailPrice: 0,
                Times: 0,
                WholesalePrice: 0,
                ImportWholesalePrice: 0,
                RetailUnit: null,
                WholesaleUnit: null
            };
        };
        ProductEditor.prototype.validate = function () {
            // TODO: Fields validation before saving
        };
        return ProductEditor;
    }(PageBase_1.PageBase));
    exports.ProductEditor = ProductEditor;
});
//# sourceMappingURL=ProductEditor.js.map