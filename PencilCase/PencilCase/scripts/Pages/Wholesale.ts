﻿import { DealPageBase } from './DealPageBase';
import * as Consts from './Consts';
import { Order } from '../Models/Order';
import * as Utils from '../Utils';
import { OrderTypes } from '../Models/Order';
import { Application } from '../application';

export class Wholesale extends DealPageBase {
    constructor() {
        super();
        this.title = ko.observable("批发");
        this.pageId = Consts.Pages.Whosale.Id;
        this.onSelectionChanged = (newValue: string) => {
            this.selectedProduct(this.dict[newValue]);
            if (this.selectedProduct() && this.selectedProduct().Id !== this.selectOptions.Id) {
                this.selectedProductPrice(this.selectedProduct().WholesalePrice ? this.selectedProduct().WholesalePrice : 0);
            }
        };
        this.selectedProductId.subscribe(this.onSelectionChanged);
    }

    protected addOrder = () => {
        this.addOrderWithSpecifiedPrice(this.selectedProductPrice(), OrderTypes.Wholesale);
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
                { Field: "Inventory", Type: "number", Value: "Inventory - " + (order.quantity() * product.Times) }
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
                this.navigator.showConfirmDialog("批发", "已成功生成订单。", false, true, null, null, null, '好');
            });
    }

    protected onDBError = (transaction: SqlTransaction, sqlError: SqlError) => {
        if (transaction == null) {
            alert("Wholesale Page: Error happened, failed to complete the operation, all data is rolled back." + sqlError.message);
        }
        else {
            alert("Wholesale Page: " + sqlError.message);
        }
    }
}