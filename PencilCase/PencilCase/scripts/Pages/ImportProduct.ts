import { DealPageBase } from './DealPageBase';
import * as Consts from './Consts';
import { Order } from '../Models/Order';
import * as Utils from '../Utils';
import { OrderTypes } from '../Models/Order';

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
        this.addOrderWithSpecifiedPrice(this.selectedProductImportPrice());
    }

    protected save = () => {
        for (let i = 0; i < this.orders().length; i++) {
            let order = this.orders()[i];
            order.createdDate = new Date(Date.now());
            order.modifiedDate = order.createdDate;
            let product = order.product();
            let newRetailCost = ((product.RetailCost * product.Inventory) + (order.price() * order.quantity())) / (product.Inventory + order.quantity() * product.Times);
            let newWholesaleCost = newRetailCost * product.Times;

            this.orderRepository.insert(order, (transaction: SqlTransaction, resultSet: SqlResultSet) => {
                this.productRepository.updateWithFieldValues([
                    { Field: "Inventory", Type: "number", Value: "Inventory + " + (order.quantity() * product.Times) },
                    { Field: "RetailCost", Type: "number", Value: newRetailCost },
                    { Field: "WholesaleCost", Type: "number", Value: newWholesaleCost },
                    { Field: "ImportWholesalePrice", Type: "number", Value: order.price() },
                    { Field: "ImportRetailPrice", Type: "number", Value: product.ImportWholesalePrice / product.Times },
                ], product.Id, (transaction: SqlTransaction, resultSet: SqlResultSet) => {
                }, (transaction: SqlTransaction, sqlError: SqlError) => {
                    alert("Faield to update Product: " + product.Id + '\r\n' + sqlError.message);
                });
            }, (transaction: SqlTransaction, sqlError: SqlError) => {
                alert("Faield to inser new Order: " + order.id() + '\r\n' + sqlError.message);
            });            
        }

        // 上面的数据库操作是异步处理，所以即使有插入错误，这里也会被调用。有后续PBI解决这个问题。
        // 整个订单插入，库存修改应做成事务处理。
        // 所以这里的批处理情况不适用于使用repository. 可以让repository 返回组合成的sql 语句，然后在这里用一个事务处理。
        this.cancelOrders();
        this.navigator.showConfirmDialog("进货", "已添加成功。", false, true, null, null, null, '好');
    }

    protected onDBError = (transaction: SqlTransaction, sqlError: SqlError) => {
        alert("Import Product Page: " + sqlError.message);
    }
}