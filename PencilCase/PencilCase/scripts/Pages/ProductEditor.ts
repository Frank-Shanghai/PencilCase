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

    // Since relative/absolute path doesn't work, so here use the base64 string to store the default empty image
    // https://stackoverflow.com/questions/9073953/phonegap-on-ios-with-absolute-path-urls-for-assets
    private defaultImage = "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";

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