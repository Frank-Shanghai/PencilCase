import { DealPageBase } from './DealPageBase';
import * as Consts from './Consts';
import { Order } from '../Models/Order';
import * as Utils from '../Utils';
import { OrderTypes } from '../Models/Order';

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
        for (let i = 0; i < this.orders().length; i++) {
            let order = this.orders()[i];
            order.createdDate = new Date(Date.now());
            order.modifiedDate = order.createdDate;
            let product = order.product();

            this.orderRepository.insert(order, (transaction: SqlTransaction, resultSet: SqlResultSet) => {
                this.productRepository.updateWithFieldValues([
                    { Field: "Inventory", Type: "number", Value: "Inventory - " + order.quantity() }
                ], product.Id, (transaction: SqlTransaction, resultSet: SqlResultSet) => {
                }, (transaction: SqlTransaction, sqlError: SqlError) => {
                    alert("Faield to update Product: " + product.Id + '\r\n' + sqlError.message);
                });
            }, (transaction: SqlTransaction, sqlError: SqlError) => {
                alert("Faield to inser new Order: " + order.id() + '\r\n' + sqlError.message);
            });
        }

        this.cancelOrders();
        this.navigator.showConfirmDialog("零售", "已成功生成订单。", false, true, null, null, null, '好');
    }

    protected onDBError = (transaction: SqlTransaction, sqlError: SqlError) => {
        alert("Retail Page: " + sqlError.message);
    }
}