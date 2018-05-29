import { PageBase } from './PageBase';
import { Navigator } from '../Navigator';
import * as Consts from './Consts';
import { Order } from '../Models/Order';
import { OrderTypes } from '../Models/Order';
import { OrderRepository } from '../Repositories/OrderRepository';

export class BatchOrderDetails extends PageBase {
    private navigator: Navigator = Navigator.instance;
    private orders: KnockoutObservableArray<any> = ko.observableArray([]);

    constructor(private parameters?: any) {
        super();
        this.title = ko.observable("Order Details");
        this.pageId = Consts.Pages.BathOrderDetails.Id;
        this.back = () => {
            this.navigator.navigateTo(Consts.Pages.OrderManagement, {
                changeHash: true,
            });
        }
    }

    public initialize() {
        let orderRepository: OrderRepository = new OrderRepository();
        orderRepository.getOrdersByBatchId(this.parameters.batchOrder.Id, (transaction: SqlTransaction, resultSet: SqlResultSet) => {
            this.orders([]); // First, clear products collection
            let rows = resultSet.rows;
            for (let i = 0; i < rows.length; i++) {
                this.orders.push(rows[i]);
            }
        }, this.onDBError);
    }

    private getTypeName(type: OrderTypes) {
        switch (type) {
            case OrderTypes.Import:
                return "进货";
            case OrderTypes.Retail:
                return "零售";
            case OrderTypes.Wholesale:
                return "批发";
        }
    }

    private onDBError = (transaction: SqlTransaction, sqlError: SqlError) => {
        alert("Batch Order Details Page: " + sqlError.message);
    }
}