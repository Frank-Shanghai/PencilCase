import { DealPageBase } from './DealPageBase';
import * as Consts from './Consts';
import { Order } from '../Models/Order';
import * as Utils from '../Utils';
import { OrderTypes } from '../Models/Order';
import { Application } from '../application';

export class ImportProduct extends DealPageBase {
    private selectedProductImportPrice: KnockoutObservable<number> = ko.observable(0);

    constructor() {
        super();
        this.title = ko.observable("进货");
        this.pageId = Consts.Pages.ImportProduct.Id;
        this.onSelectionChanged = (newValue: string) => {
            this.selectedProduct(this.dict[newValue]);
            if (this.selectedProduct() && this.selectedProduct().Id !== this.selectOptions.Id) {
                this.selectedProductImportPrice(this.selectedProduct().ImportWholesalePrice ? this.selectedProduct().ImportWholesalePrice : 0);
            }
        };
        this.selectedProductId.subscribe(this.onSelectionChanged);
    }

    protected addOrder = () => {
        this.addOrderWithSpecifiedPrice(this.selectedProductImportPrice(), OrderTypes.Import);
    }

    protected save = () => {
        let sqlStatements: Array<string> = [];
        // Make sure the orders in this batch have the same created date, it's necessary for grouping purpose
        let createdDate = new Date(Date.now());

        for (let i = 0; i < this.orders().length; i++) {
            let order = this.orders()[i];
            order.createdDate = createdDate;
            order.modifiedDate = order.createdDate;
            let product = order.product();
            let newRetailCost = ((product.RetailCost * product.Inventory) + (order.price() * order.quantity())) / (product.Inventory + order.quantity() * product.Times);
            let newWholesaleCost = newRetailCost * product.Times;

            sqlStatements.push(this.orderRepository.insertSqlStatement(order));
            sqlStatements.push(this.productRepository.updateWithFieldValuesSqlStatement([
                { Field: "Inventory", Type: "number", Value: "Inventory + " + (order.quantity() * product.Times) },
                { Field: "RetailCost", Type: "number", Value: newRetailCost },
                { Field: "WholesaleCost", Type: "number", Value: newWholesaleCost },
                { Field: "ImportWholesalePrice", Type: "number", Value: order.price() },
                { Field: "ImportRetailPrice", Type: "number", Value: product.ImportWholesalePrice / product.Times },
            ], product.Id));
        }

        let db = Application.instance.openDataBase();
        db.transaction((transaction: SqlTransaction) => {
            for (let i = 0; i < sqlStatements.length; i++) {
                transaction.executeSql(sqlStatements[i], [], null, this.onDBError);
            }
        },
            (error: SqlError) => {
                this.onDBError(null, error);
            },
            () => {
                this.cancelOrders();
                this.navigator.showConfirmDialog("进货", "已添加成功。", false, true, null, null, null, '好');
            });
    }

    protected onDBError = (transaction: SqlTransaction, sqlError: SqlError) => {
        if (transaction == null) {
            alert("Import Product Page: Error happened, failed to complete the operation, all data is rolled back." + sqlError.message);
        }
        else {
            alert("Import Product Page: " + sqlError.message);
        }
    }
}