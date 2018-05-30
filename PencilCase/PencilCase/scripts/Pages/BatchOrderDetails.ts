import { PageBase } from './PageBase';
import { Navigator } from '../Navigator';
import * as Consts from './Consts';
import { Order } from '../Models/Order';
import { OrderTypes } from '../Models/Order';
import { OrderRepository } from '../Repositories/OrderRepository';
import { ProductRepository } from '../Repositories/ProductRepository';

export class BatchOrderDetails extends PageBase {
    private navigator: Navigator = Navigator.instance;
    private orders: KnockoutObservableArray<any> = ko.observableArray([]);

    constructor(parameters?: any) {
        super(parameters);
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
        let productRepository: ProductRepository = new ProductRepository();
        orderRepository.getOrdersByBatchId(this.parameters.batchOrder.BatchId, (transaction: SqlTransaction, resultSet: SqlResultSet) => {
            this.orders([]); // First, clear products collection
            let rows = resultSet.rows;
            for (let i = 0; i < rows.length; i++) {
                let order = rows[i];
                productRepository.getProductById(order.ProductId, (transaction: SqlTransaction, resultSet: SqlResultSet) => {
                    $.extend(order, { Product: resultSet.rows[0] });

                    this.orders.push(order);
                }, this.onDBError);
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