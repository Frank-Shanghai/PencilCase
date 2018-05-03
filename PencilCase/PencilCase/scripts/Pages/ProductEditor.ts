import { PageBase } from './PageBase';
import { Navigator } from '../Navigator';
import * as Utils from '../Utils';
import * as Consts from './Consts';

export class ProductEditor extends PageBase {
    private navigator: Navigator = Navigator.instance;
    private isInEditingMode: KnockoutObservable<boolean> = ko.observable(false);
    private isNotInEditingMode: KnockoutComputed<boolean>;
    private originalProduct: KnockoutObservable<any> = ko.observable(null);
    private uomDataSource: KnockoutObservableArray<any> = ko.observableArray([]);

    private name: KnockoutObservable<string> = ko.observable('');
    private description: KnockoutObservable<string> = ko.observable('');
    private inventory: KnockoutObservable<number> = ko.observable(0);

    private retailPrice: KnockoutObservable<number> = ko.observable(0);
    private retailUnit: KnockoutObservable<string> = ko.observable(null);
    private wholesaleUnit: KnockoutObservable<string> = ko.observable(null);
    private times: KnockoutObservable<number> = ko.observable(undefined);
    private wholesalePrice: KnockoutObservable<number> = ko.observable(undefined);
    private importWholesalePrice: KnockoutObservable<number> = ko.observable(undefined);

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
                this.originalProduct(this.createEmptyProduct());
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
        this.importWholesalePrice(this.parameters.product.ImportWholesalePrice);
    }

    private createEmptyProduct() {
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
    }

    // 方法名不能是delete，否则前台绑定后，有奇怪的错误，viewmodel识别不了。
    // 花了1小时发现的问题，难道是某种豫留关键字或什么东西。
    private deleteProduct = () => {
        alert("Not implemented yet.");
    }

    private save = () => {
        let db = window.openDatabase("PencilCase", "0.1", "Pencil Case", 2 * 1024 * 1024);
        if (db) {
            let guid = null;
            if (this.isNewProduct === true) {
                guid = Utils.guid();
            }
            else {
                guid = this.parameters.product.Id;
            }

            let name = this.name();
            let description = this.description();
            let retailPrice = this.retailPrice();
            let retailUnit = this.retailUnit();
            let wholesalePrice = this.wholesalePrice();
            let wholesaleUnit = this.wholesaleUnit();
            let importWholesalePrice = this.importWholesalePrice(); // TODO: May set as not editable but calculate the actual value everytime when importing products
            let importRetailPrice = this.importWholesalePrice() / this.times();
            let times = this.times();
            let inventory = this.inventory();
            let image = '暂不可用';
            let modifiedDate = new Date(Date.now());


            if (this.isNewProduct == true) {
                let sqlString = "insert into Product values ('" + guid + "','" + name + "','" + description + "'," + retailPrice + ",'" + retailUnit + "'," +
                    wholesalePrice + ",'" + wholesaleUnit + "'," + importWholesalePrice + "," + importRetailPrice + "," + times + "," + inventory + ",'" + image + "','" +
                    moment(modifiedDate.toISOString()).format("YYYY-MM-DD") + "','" + moment(modifiedDate.toISOString()).format("YYYY-MM-DD") + "')";

                db.transaction((transaction) => {
                    transaction.executeSql(sqlString, [], (transaction: SqlTransaction, resultSet: SqlResultSet) => {
                        transaction.executeSql("select P.*, UOM1.Name RetailUnitName, UOM2.Name WholesaleUnitName from Product P \
                                                join UnitOfMeasure UOM1 on P.RetailUnit = UOM1.Id\
                                                join UnitOfMeasure UOM2 on P.WholesaleUnit = UOM2.Id\
                                                where P.rowid = " + resultSet.insertId,
                            [], (trans: SqlTransaction, results: SqlResultSet) => {
                                this.originalProduct(results.rows.item(0));
                                this.isInEditingMode(false);
                                this.isNewProduct = false;
                            }, this.onDBError);
                    }, this.onDBError);
                });
            }
            else {
                db.transaction((transaction) => {
                    let sqlString = "update Product set Name = '" + name + "', Description = '" + description + "', RetailPrice = " + retailPrice + ", RetailUnit = '" + retailUnit + "', WholesalePrice = " +
                        wholesalePrice + ", WholesaleUnit = '" + wholesaleUnit + "', ImportWholesalePrice = " + importWholesalePrice + ", ImportRetailPrice = " + importRetailPrice + ", Times = " + times + ", Inventory = " + inventory + ", Image = '" + image + "', ModifiedDate = '" +
                        moment(modifiedDate.toISOString()).format("YYYY-MM-DD") + "' where Id = '" + guid + "'";

                    transaction.executeSql(sqlString, [], (transaction: SqlTransaction, resultSet: SqlResultSet) => {
                        transaction.executeSql("select P.*, UOM1.Name RetailUnitName, UOM2.Name WholesaleUnitName from Product P \
                                                    join UnitOfMeasure UOM1 on P.RetailUnit = UOM1.Id\
                                                    join UnitOfMeasure UOM2 on P.WholesaleUnit = UOM2.Id\
                                                    where P.Id = '" + guid + "'", [],
                            (trans: SqlTransaction, results: SqlResultSet) => {
                                this.originalProduct(results.rows.item(0));
                                this.isInEditingMode(false);
                            }, this.onDBError);
                    }, this.onDBError);
                });
            }
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
            changeHash: false,
            dataUrl: "ProdutManagement"
        });
    }

    private onDBError = (transaction: SqlTransaction, sqlError: SqlError) => {
        alert(sqlError.message);
    }

}