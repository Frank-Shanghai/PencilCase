import { PageBase } from './PageBase';
import { Navigator } from '../Navigator';
import * as Consts from './Consts';
import { Order } from '../Models/Order';
import { OrderTypes } from '../Models/Order';
import { OrderRepository } from '../Repositories/OrderRepository';

export class Orders extends PageBase {
    private navigator: Navigator = Navigator.instance;
    private batchOrders: KnockoutObservableArray<IBatchOrder> = ko.observableArray([]);

    constructor() {
        super();
        this.title = ko.observable("Orders Management");
        this.pageId = Consts.Pages.OrderManagement.Id;
        this.back = Navigator.instance.goHome;
    }

    public initialize() {
        let orderRepository: OrderRepository = new OrderRepository();
        orderRepository.getBatchOrders((transaction: SqlTransaction, resultSet: SqlResultSet) => {
            this.batchOrders([]); // First, clear products collection
            let rows = resultSet.rows;
            for (let i = 0; i < rows.length; i++) {
                this.batchOrders.push({
                    BatchId: rows[i].BatchId,
                    Type: rows[i].Type,
                    Quantity: rows[i].Quantity,
                    Total: rows[i].Total,
                    CreatedDate: rows[i].CreatedDate
                });
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
            case OrderTypes.RetailWholesale:
                return "零批";
        }
    }

    private showDetails = (batchOrder: IBatchOrder) => {
        this.navigator.navigateTo(Consts.Pages.BathOrderDetails, {
            data: {
                parameters: {
                    batchOrder: batchOrder
                }
            },
            changeHash: true
        });
    }

    private onDBError = (transaction: SqlTransaction, sqlError: SqlError) => {
        alert("Order Management Page: " + sqlError.message);
    }
}

interface IBatchOrder {
    //select BatchId, Type, Sum(Quantity) as Quantity, Sum(Total) as Total, CreatedDate from Orders group by BatchId, Type, CreatedDate
    BatchId: string;
    Type: OrderTypes;
    Quantity: number;
    Total: number;
    CreatedDate: string;
}