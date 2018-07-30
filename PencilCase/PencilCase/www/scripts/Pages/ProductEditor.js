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
            _this.defaultImage = "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";
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