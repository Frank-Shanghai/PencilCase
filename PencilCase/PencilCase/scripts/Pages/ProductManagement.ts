import { PageBase } from './PageBase';
import { Navigator } from '../Navigator';
import * as Consts from './Consts';

export class ProductManagement extends PageBase {
    private navigator: Navigator = Navigator.instance;
    private products: KnockoutObservableArray<any> = ko.observableArray([]);

    constructor() {
        super();
        this.title = ko.observable("Product Management");
        this.pageId = Consts.Pages.ProductManagement.Id;
    }

    public initialize() {
        let db = window.openDatabase("PencilCase", "0.1", "Pencil Case", 2 * 1024 * 1024);
        if (db) {
            db.transaction((transaction) => {
                transaction.executeSql('select P.*, UOM1.Name RetailUnitName, UOM2.Name WholesaleUnitName from Product P \
                                        join UnitOfMeasure UOM1 on P.RetailUnit = UOM1.Id \
                                        join UnitOfMeasure UOM2 on P.WholesaleUnit = UOM2.Id', [], (transaction: SqlTransaction, resultSet: SqlResultSet) => {
                    this.products([]); // First, clear products collection
                    let rows = resultSet.rows;
                    for (let i = 0; i < rows.length; i++) {
                        this.products.push(rows[i]);
                    }
                }, this.onDBError);
            });
        }
    }

    private addNewProduct = () => {
        //this.navigator.navigateTo($("div#ProductEditor").first(), {
        //    data: {
        //        pageInfo: Consts.Pages.ProductEditor,
        //        //selectedProduct: null or one product instance
        //    }
        //});

        let first = this.products()[0];
        this.products.push(first);
    }

    private showDetails = (product: any) => {
        this.navigator.navigateTo(Consts.Pages.ProductEditor, {
            data: {
                parameters: {
                    product: product
                }
            },
            changeHash: false
        });
    }

    private onDBError = (transaction: SqlTransaction, sqlError: SqlError) => {
        alert(sqlError.message);
    }
}