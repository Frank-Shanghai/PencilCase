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
define(["require", "exports", "./PageBase", "../Navigator", "../Utils", "./Consts", "../Models/Product", "../Repositories/ProductRepository"], function (require, exports, PageBase_1, Navigator_1, Utils, Consts, Product_1, ProductRepository_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    (ko.extenders).required = function (target, overrideMessage) {
        //add some sub-observables to our observable
        target.hasError = ko.observable();
        target.validationMessage = ko.observable();
        //define a function to do validation
        function validate(newValue) {
            target.hasError(newValue ? false : true);
            target.validationMessage(newValue ? "" : overrideMessage || "* 不能为空！");
        }
        //initial validation
        validate(target());
        //validate whenever the value changes
        target.subscribe(validate);
        //return the original observable
        return target;
    };
    (ko.extenders).regExpValidate = function (target, options) {
        //add some sub-observables to our observable
        target.hasError = ko.observable();
        target.validationMessage = ko.observable();
        //define a function to do validation
        function validate(newValue) {
            target.hasError(options.regExp.test(newValue) ? false : true);
            target.validationMessage(newValue ? "" : options.overrideMessage || "* 非法输入!");
        }
        //initial validation
        validate(target());
        //validate whenever the value changes
        target.subscribe(validate);
        //return the original observable
        return target;
    };
    var ProductEditor = (function (_super) {
        __extends(ProductEditor, _super);
        function ProductEditor(parameters) {
            var _this = _super.call(this, parameters) || this;
            _this.navigator = Navigator_1.Navigator.instance;
            _this.repository = new ProductRepository_1.ProductRepository();
            _this.isInEditingMode = ko.observable(false);
            _this.originalProduct = ko.observable(null);
            _this.uomDataSource = ko.observableArray([]);
            _this.name = ko.observable('').extend({ required: '' });
            _this.description = ko.observable('');
            _this.inventory = ko.observable(0);
            _this.floatNumberRegExp = /^[0-9]+([.]{1}[0-9]+){0,1}$/;
            _this.retailPrice = ko.observable(undefined).extend({ regExpValidate: { regExp: _this.floatNumberRegExp, overrideMessage: '' } });
            _this.retailWholesalePrice = ko.observable(undefined).extend({ regExpValidate: { regExp: _this.floatNumberRegExp, overrideMessage: '' } });
            _this.retailUnit = ko.observable(null);
            _this.wholesaleUnit = ko.observable(null);
            _this.times = ko.observable(undefined).extend({ regExpValidate: { regExp: _this.floatNumberRegExp, overrideMessage: '' } });
            _this.wholesalePrice = ko.observable(undefined).extend({ regExpValidate: { regExp: _this.floatNumberRegExp, overrideMessage: '' } });
            _this.imageSource = ko.observable(null);
            _this.defaultImagePath = "/images/nophoto.jpg";
            _this.isNewProduct = false;
            _this.canSave = ko.computed(function () {
                if (_this.name.hasError() || _this.retailPrice.hasError() || _this.retailWholesalePrice.hasError() || _this.times.hasError() || _this.wholesalePrice.hasError())
                    return false;
                return true;
            });
            _this.startEditing = function () {
                _this.isInEditingMode(true);
                _this.reSetEditingFields();
            };
            _this.reSetEditingFields = function () {
                _this.name(_this.parameters.product.Name);
                _this.description(_this.parameters.product.Description);
                _this.inventory(_this.parameters.product.Inventory);
                _this.retailPrice(_this.parameters.product.RetailPrice);
                _this.retailWholesalePrice(_this.parameters.product.RetailWholesalePrice);
                _this.times(_this.parameters.product.Times);
                _this.retailUnit(_this.parameters.product.RetailUnit);
                _this.wholesaleUnit(_this.parameters.product.WholesaleUnit);
                _this.wholesalePrice(_this.parameters.product.WholesalePrice);
                _this.imageSource(_this.parameters.product.Image);
            };
            // 方法名不能是delete，否则前台绑定后，有奇怪的错误，viewmodel识别不了。
            // 花了1小时发现的问题，难道是某种豫留关键字或什么东西。
            _this.deleteProduct = function () {
                var doDelete = function () {
                    _this.repository.delete(_this.originalProduct().Id, function (transaction, resultSet) {
                        _this.doGoBack();
                    }, _this.onDBError);
                };
                _this.navigator.showConfirmDialog("删除产品", "是否确认删除？", true, true, doDelete);
            };
            _this.save = function () {
                var product = new Product_1.Product();
                product.Name = _this.name();
                product.Description = _this.description();
                product.RetailPrice = _this.retailPrice();
                product.RetailWholesalePrice = _this.retailWholesalePrice();
                product.RetailUnit = _this.retailUnit();
                product.WholesalePrice = _this.wholesalePrice();
                product.WholesaleUnit = _this.wholesaleUnit();
                product.ImportWholesalePrice = _this.originalProduct().ImportWholesalePrice;
                product.ImportRetailPrice = _this.originalProduct().ImportRetailPrice;
                product.WholesaleCost = _this.originalProduct().WholesaleCost;
                product.RetailCost = _this.originalProduct().RetailCost;
                product.Times = _this.times();
                product.Inventory = _this.inventory();
                product.Image = _this.imageSource();
                product.ModifiedDate = new Date(Date.now());
                var guid = null;
                if (_this.isNewProduct === true) {
                    product.Id = Utils.guid();
                    product.CreatedDate = new Date(Date.now());
                    _this.repository.insert(product, function (transaction, resultSet) {
                        _this.repository.getProductByRowId(resultSet.insertId, function (trans, results) {
                            _this.originalProduct(new Product_1.Product(results.rows.item(0)));
                            _this.isInEditingMode(false);
                            _this.isNewProduct = false;
                        }, _this.onDBError);
                    }, _this.onDBError);
                }
                else {
                    product.Id = _this.originalProduct().Id;
                    product.CreatedDate = _this.originalProduct().CreatedDate;
                    _this.repository.update(product, function (transaction, resultSet) {
                        _this.repository.getProductById(product.Id, function (trans, results) {
                            _this.originalProduct(new Product_1.Product(results.rows.item(0)));
                            _this.isInEditingMode(false);
                        }, _this.onDBError);
                    }, _this.onDBError);
                }
            };
            _this.cancel = function () {
                if (_this.isNewProduct == true) {
                    _this.doGoBack();
                }
                else {
                    _this.isInEditingMode(false);
                }
            };
            _this.doGoBack = function () {
                _this.navigator.navigateTo(Consts.Pages.ProductManagement, {
                    changeHash: true,
                });
            };
            _this.getImage = function () {
                navigator.camera.getPicture(_this.onPhotoDataSuccess, _this.onFail, {
                    quality: 50,
                    destinationType: 0
                });
            };
            _this.onPhotoDataSuccess = function (imageData) {
                console.log(imageData);
                _this.imageSource(imageData);
            };
            _this.onDBError = function (transaction, sqlError) {
                alert("Product Editor: " + sqlError.message);
            };
            _this.title = ko.observable("Product Editor");
            _this.pageId = Consts.Pages.ProductEditor.Id;
            _this.back = function () {
                if (_this.isInEditingMode() === true) {
                    _this.cancel();
                }
                else {
                    _this.doGoBack();
                }
            };
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
                    _this.originalProduct(new Product_1.Product());
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
        ProductEditor.prototype.validate = function () {
            // TODO: Fields validation before saving
        };
        ProductEditor.prototype.onFail = function (message) {
            alert('Failed because: ' + message);
        };
        return ProductEditor;
    }(PageBase_1.PageBase));
    exports.ProductEditor = ProductEditor;
});
//# sourceMappingURL=ProductEditor.js.map