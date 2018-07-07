import { DealPageBase } from './DealPageBase';
import * as Consts from './Consts';
import { Order } from '../Models/Order';
import * as Utils from '../Utils';
import { OrderTypes } from '../Models/Order';
import { Application } from '../application';

export class RetailWholesale extends DealPageBase {
    constructor() {
        super();
        this.title = ko.observable("零批");
        this.pageId = Consts.Pages.RetailWholesale.Id;
        this.onSelectionChanged = (newValue: string) => {
            this.selectedProduct(this.dict[newValue]);
        };
        this.selectedProductId.subscribe(this.onSelectionChanged);
    }

    protected addOrder = () => {
        this.addOrderWithSpecifiedPrice(this.selectedProduct().RetailWholesalePrice, OrderTypes.RetailWholesale);
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

            sqlStatements.push(this.orderRepository.insertSqlStatement(order));
            sqlStatements.push(this.productRepository.updateWithFieldValuesSqlStatement([
                { Field: "Inventory", Type: "number", Value: "Inventory - " + order.quantity() }
            ], product.Id));
        }

        let db = Application.instance.openDataBase();
        db.transaction((transaction: SqlTransaction) => {
            for (let i = 0; i < sqlStatements.length; i++) {
                // if you handled the exception when executing sql, it won't throw it up to parent level, which mean 
                // the error handler for db.transaction(..., ..., ...) won't be called, BUT the success call back will be called
                // So, to avoid the confusing issue mentioned above, DO NOT handle the transaction.executeSql exception, 
                // leave it to be handled by parent level, and everything will be rolled back
                //transaction.executeSql(sqlStatements[i], [], null, this.onDBError);
                transaction.executeSql(sqlStatements[i]);
            }
        },
            (error: SqlError) => {
                this.onDBError(null, error);
            },
            () => {
                this.cancelOrders();
                this.navigator.showConfirmDialog("零批", "已成功生成订单。", false, true, null, null, null, '好');
            });

    }

    protected onDBError = (transaction: SqlTransaction, sqlError: SqlError) => {
        if (transaction == null) {
            alert("Retail Wholesale Page: Error happened, failed to complete the operation, all data is rolled back." + sqlError.message);
        }
        else {
            alert("Retail Wholesale Page: " + sqlError.message);
        }
    }
}