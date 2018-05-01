import { PageBase } from './PageBase';
import { Navigator } from '../Navigator';
import * as Consts from './Consts';

export class ProductEditor extends PageBase {
    private navigator: Navigator = Navigator.instance;
    private isInEditingMode: KnockoutObservable<boolean> = ko.observable(false);
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

    constructor(private parameters?: any) {
        super();
        this.title = ko.observable("Product Editor");
        this.pageId = Consts.Pages.ProductEditor.Id;

        if (parameters && parameters.product) {
            this.originalProduct(parameters.product);
        }
        else {
            // TODO: Creat a new product
            // entering editing mode directly
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

                    this.retailUnit(this.parameters.product.RetailUnit);
                    this.wholesaleUnit(this.parameters.product.WholesaleUnit);
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
        this.wholesalePrice(this.parameters.product.WholesalePrice);
        this.importWholesalePrice(this.parameters.product.ImportWholesalePrice);
    }

    // 方法名不能是delete，否则前台绑定后，有奇怪的错误，viewmodel识别不了。
    // 花了1小时发现的问题，难道是某种豫留关键字或什么东西。
    private deleteProduct = () => {
        alert("Not implemented yet.");
    }

    private save = () => {;
        alert("Not implemented yet.");
    }

    private cancel = () => {
        this.isInEditingMode(false);
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