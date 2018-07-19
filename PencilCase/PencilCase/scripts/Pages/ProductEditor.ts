import { PageBase } from './PageBase';
import { Navigator } from '../Navigator';
import * as Utils from '../Utils';
import * as Consts from './Consts';
import { Product } from '../Models/Product';
import { ProductRepository } from '../Repositories/ProductRepository';

(<any>(ko.extenders)).required = function (target, overrideMessage) {
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

(<any>(ko.extenders)).regExpValidate = function (target, options: { regExp: any, overrideMessage: string }) {
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


export class ProductEditor extends PageBase {
    private navigator: Navigator = Navigator.instance;
    private repository: ProductRepository = new ProductRepository();
    private isInEditingMode: KnockoutObservable<boolean> = ko.observable(false);
    private isNotInEditingMode: KnockoutComputed<boolean>;
    private originalProduct: KnockoutObservable<Product> = ko.observable(null);
    private uomDataSource: KnockoutObservableArray<any> = ko.observableArray([]);

    private name: KnockoutObservable<string> = ko.observable('').extend({ required: '' });
    private description: KnockoutObservable<string> = ko.observable('');
    private inventory: KnockoutObservable<number> = ko.observable(0);

    private floatNumberRegExp = /^[0-9]+([.]{1}[0-9]+){0,1}$/;

    private retailPrice: KnockoutObservable<number> = ko.observable(undefined).extend({ regExpValidate: { regExp: this.floatNumberRegExp, overrideMessage: '' } });
    private retailWholesalePrice: KnockoutObservable<number> = ko.observable(undefined).extend({ regExpValidate: { regExp: this.floatNumberRegExp, overrideMessage: '' } });
    private retailUnit: KnockoutObservable<string> = ko.observable(null);
    private wholesaleUnit: KnockoutObservable<string> = ko.observable(null);
    private times: KnockoutObservable<number> = ko.observable(undefined).extend({ regExpValidate: { regExp: this.floatNumberRegExp, overrideMessage: '' } });
    private wholesalePrice: KnockoutObservable<number> = ko.observable(undefined).extend({ regExpValidate: { regExp: this.floatNumberRegExp, overrideMessage: '' } });
    private imageSource: KnockoutObservable<any> = ko.observable(null);

    private defaultImagePath = "/images/nophoto.jpg";

    private isNewProduct = false;

    private canSave = ko.computed(() => {
        if ((<any>this.name).hasError() || (<any>this.retailPrice).hasError() || (<any>this.retailWholesalePrice).hasError() || (<any>this.times).hasError() || (<any>this.wholesalePrice).hasError())
            return false;
        return true;
    });


    constructor(parameters?: any) {
        super(parameters);
        this.title = ko.observable("Product Editor");
        this.pageId = Consts.Pages.ProductEditor.Id;
        this.back = () => {
            if (this.isInEditingMode() === true) {
                this.cancel();
            }
            else {
                this.doGoBack();
            }
        }

        this.isNotInEditingMode = ko.computed(() => {
            return !this.isInEditingMode();
        });

        if (parameters && parameters.product) {
            this.originalProduct(parameters.product);
        }
        else {
            if (parameters.product == null) {
                // Adding a new product
                // To avoid refreshing the content view, initialize the originalProduct as an empty product with requested fields
                // KO if works, but lost Jquery enhancement when DOM re-created, and KO visible binding just didn't remove DOM but make them invisible, so the binding behind still works,
                // and it will fail because of binding to fields of null (orginalProduct is null when adding new product)
                // So here I didn't use KO if, but set orginalProduct as an empty entity, in this way, KO visible binding works
                this.originalProduct(new Product());
                this.isInEditingMode(true);
                this.isNewProduct = true;
            }
        }
    }

    public initialize() {
        let db = window.openDatabase("PencilCase", "0.1", "Pencil Case", 2 * 1024 * 1024);
        if (db) {
            db.transaction((transaction) => {
                transaction.executeSql('select * from UnitOfMeasure', [], (transaction: SqlTransaction, resultSet: SqlResultSet) => {
                    for (let i = 0; i < resultSet.rows.length; i++) {
                        this.uomDataSource.push(resultSet.rows.item(i));
                    }

                    if (this.parameters.product) {
                        this.retailUnit(this.parameters.product.RetailUnit);
                        this.wholesaleUnit(this.parameters.product.WholesaleUnit);
                    }
                    else {
                        this.retailUnit(null);
                        this.wholesaleUnit(null);
                    }
                }, this.onDBError);
            });
        }
    }

    private startEditing = () => {
        this.isInEditingMode(true);
        this.reSetEditingFields();
    }

    private reSetEditingFields = () => {
        this.name(this.parameters.product.Name);
        this.description(this.parameters.product.Description);
        this.inventory(this.parameters.product.Inventory);
        this.retailPrice(this.parameters.product.RetailPrice);
        this.retailWholesalePrice(this.parameters.product.RetailWholesalePrice);
        this.times(this.parameters.product.Times);
        this.retailUnit(this.parameters.product.RetailUnit);
        this.wholesaleUnit(this.parameters.product.WholesaleUnit);
        this.wholesalePrice(this.parameters.product.WholesalePrice);
        this.imageSource(this.parameters.product.Image);
    }

    // 方法名不能是delete，否则前台绑定后，有奇怪的错误，viewmodel识别不了。
    // 花了1小时发现的问题，难道是某种豫留关键字或什么东西。
    private deleteProduct = () => {
        let doDelete = () => {
            this.repository.delete(this.originalProduct().Id, (transaction: SqlTransaction, resultSet: SqlResultSet) => {
                this.doGoBack();
            }, this.onDBError);
        }

        this.navigator.showConfirmDialog("删除产品", "是否确认删除？", true, true, doDelete);
    }

    private save = () => {
        let product: Product = new Product();

        product.Name = this.name();
        product.Description = this.description();
        product.RetailPrice = this.retailPrice();
        product.RetailWholesalePrice = this.retailWholesalePrice();
        product.RetailUnit = this.retailUnit();
        product.WholesalePrice = this.wholesalePrice();
        product.WholesaleUnit = this.wholesaleUnit();
        product.ImportWholesalePrice = this.originalProduct().ImportWholesalePrice;
        product.ImportRetailPrice = this.originalProduct().ImportRetailPrice;
        product.WholesaleCost = this.originalProduct().WholesaleCost;
        product.RetailCost = this.originalProduct().RetailCost;
        product.Times = this.times();
        product.Inventory = this.inventory();
        product.Image = this.imageSource();
        product.ModifiedDate = new Date(Date.now());

        let guid = null;
        if (this.isNewProduct === true) {
            product.Id = Utils.guid();
            product.CreatedDate = new Date(Date.now());
            this.repository.insert(product, (transaction: SqlTransaction, resultSet: SqlResultSet) => {
                this.repository.getProductByRowId(resultSet.insertId, (trans: SqlTransaction, results: SqlResultSet) => {
                    this.originalProduct(new Product(results.rows.item(0)));
                    this.isInEditingMode(false);
                    this.isNewProduct = false;
                }, this.onDBError);
            }, this.onDBError);
        }
        else {
            product.Id = this.originalProduct().Id;
            product.CreatedDate = this.originalProduct().CreatedDate;
            this.repository.update(product, (transaction: SqlTransaction, resultSet: SqlResultSet) => {
                this.repository.getProductById(product.Id, (trans: SqlTransaction, results: SqlResultSet) => {
                    this.originalProduct(new Product(results.rows.item(0)));
                    this.isInEditingMode(false);
                }, this.onDBError);
            }, this.onDBError);
        }
    }

    private cancel = () => {
        if (this.isNewProduct == true) {
            this.doGoBack();
        }
        else {
            this.isInEditingMode(false);
        }
    }

    private doGoBack = () => {
        this.navigator.navigateTo(Consts.Pages.ProductManagement, {
            changeHash: true,
        });
    }

    private validate() {
        // TODO: Fields validation before saving
    }

    private getImage = () => {
        navigator.camera.getPicture(this.onPhotoDataSuccess, this.onFail, {
            quality: 50,
            destinationType: 0
        })
    }

    private onPhotoDataSuccess = (imageData) => {
        console.log(imageData);
        this.imageSource(imageData);
    }

    private onFail(message) {
        alert('Failed because: ' + message);
    }


    private onDBError = (transaction: SqlTransaction, sqlError: SqlError) => {
        alert("Product Editor: " + sqlError.message);
    }

}