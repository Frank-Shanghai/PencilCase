import { PageBase } from './PageBase';
import { Navigator } from '../Navigator';
import * as Utils from '../Utils';
import * as Consts from './Consts';
import { Product } from '../Models/Product';
import { ProductRepository } from '../Repositories/ProductRepository';

export class ProductEditor extends PageBase {
    private navigator: Navigator = Navigator.instance;
    private repository: ProductRepository = new ProductRepository();
    private isInEditingMode: KnockoutObservable<boolean> = ko.observable(false);
    private isNotInEditingMode: KnockoutComputed<boolean>;
    private originalProduct: KnockoutObservable<Product> = ko.observable(null);
    private uomDataSource: KnockoutObservableArray<any> = ko.observableArray([]);

    private name: KnockoutObservable<string> = ko.observable('');
    private description: KnockoutObservable<string> = ko.observable('');
    private inventory: KnockoutObservable<number> = ko.observable(0);

    private retailPrice: KnockoutObservable<number> = ko.observable(0);
    private retailUnit: KnockoutObservable<string> = ko.observable(null);
    private wholesaleUnit: KnockoutObservable<string> = ko.observable(null);
    private times: KnockoutObservable<number> = ko.observable(undefined);
    private wholesalePrice: KnockoutObservable<number> = ko.observable(undefined);

    private isNewProduct = false;

    constructor(private parameters?: any) {
        super();
        this.title = ko.observable("Product Editor");
        this.pageId = Consts.Pages.ProductEditor.Id;
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
        this.times(this.parameters.product.Times);
        this.retailUnit(this.parameters.product.RetailUnit);
        this.wholesaleUnit(this.parameters.product.WholesaleUnit);
        this.wholesalePrice(this.parameters.product.WholesalePrice);
    }

    // 方法名不能是delete，否则前台绑定后，有奇怪的错误，viewmodel识别不了。
    // 花了1小时发现的问题，难道是某种豫留关键字或什么东西。
    private deleteProduct = () => {
        let doDelete = () => {
            let db = window.openDatabase("PencilCase", "0.1", "Pencil Case", 2 * 1024 * 1024);
            if (db) {
                db.transaction((transaction: SqlTransaction) => {
                    transaction.executeSql("delete from Product where Id = '" + this.originalProduct().Id + "'", [], (transaction: SqlTransaction, resultSet: SqlResultSet) => {
                        this.goBack();
                    }, this.onDBError);
                });
            }
        }

        this.navigator.showConfirmDialog("删除产品", "是否确认删除？", doDelete);
    }

    private save = () => {
        let product: Product = new Product();

        product.Name = this.name();
        product.Description = this.description();
        product.RetailPrice = this.retailPrice();
        product.RetailUnit = this.retailUnit();
        product.WholesalePrice = this.wholesalePrice();
        product.WholesaleUnit = this.wholesaleUnit();
        product.ImportWholesalePrice = this.originalProduct().ImportWholesalePrice;
        product.ImportRetailPrice = this.originalProduct().ImportRetailPrice;
        product.Times = this.times();
        product.Inventory = this.inventory();
        product.Image = '暂不可用';
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
            this.goBack();
        }
        else {
            this.isInEditingMode(false);
        }
    }

    private validate() {
        // TODO: Fields validation before saving
    }

    private goBack = () => {
        this.navigator.navigateTo(Consts.Pages.ProductManagement, {
            changeHash: true,
        });
    }

    private onDBError = (transaction: SqlTransaction, sqlError: SqlError, customMessage?: string) => {
        let errorMessage = sqlError.message;
        if (customMessage) {
            errorMessage = "User Message: " + customMessage + "\r\n" + errorMessage;
        }

        alert(errorMessage);
    }

}