import { DealPageBase } from './DealPageBase';
import * as Consts from './Consts';
import { Order } from '../Models/Order';
import * as Utils from '../Utils';
import { OrderTypes } from '../Models/Order';
import { Application } from '../application';

export class Retail extends DealPageBase {
    constructor() {
        super();
        this.title = ko.observable("零售");
        this.pageId = Consts.Pages.Retail.Id;
        this.onSelectionChanged = (newValue: string) => {
            this.selectedProduct(this.dict[newValue]);
        };
        this.selectedProductId.subscribe(this.onSelectionChanged);
    }

    protected addOrder = () => {
        this.addOrderWithSpecifiedPrice(this.selectedProduct().RetailPrice);
    }

    protected save = () => {
        let sqlStatements: Array<string> = [];
        for (let i = 0; i < this.orders().length; i++) {
            let order = this.orders()[i];
            order.createdDate = new Date(Date.now());
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
                transaction.executeSql(sqlStatements[i], [], null, this.onDBError);
            }
        },
            (error: SqlError) => {
                this.onDBError(null, error);
            },
            () => {
                this.cancelOrders();
                this.navigator.showConfirmDialog("零售", "已成功生成订单。", false, true, null, null, null, '好');
            });

    }

    protected onDBError = (transaction: SqlTransaction, sqlError: SqlError) => {
        if (transaction == null) {
            alert("Retail Page: Error happened, failed to complete the operation, all data is rolled back." + sqlError.message);
        }
        else {
            alert("Retail Page: " + sqlError.message);
        }
    }
}