import { PageBase } from './PageBase';
import { Navigator } from '../Navigator';
import * as Consts from './Consts';
import { Product } from '../Models/Product';
import { ProductRepository } from '../Repositories/ProductRepository';
import { OrderRepository } from '../Repositories/OrderRepository';
import { Order } from '../Models/Order';
import * as Utils from '../Utils';
import { OrderTypes } from '../Models/Order';

/*
* Extend ko functionality
* https://stackoverflow.com/questions/12822954/get-previous-value-of-an-observable-in-subscribe-of-same-observable
*/
ko.subscribable.fn.subscribeChanged = function (callback, dataContext) {
    var savedValue = this.peek();
    return this.subscribe(function (latestValue) {
        var oldValue = savedValue;
        savedValue = latestValue;
        callback(latestValue, oldValue, dataContext);
    });
};

export class DealPageBase extends PageBase {
    protected navigator: Navigator = Navigator.instance;
    protected products: KnockoutObservableArray<Product> = ko.observableArray([]);
    protected dict = {};
    protected selectOptions = { Id: "placeholder", Name: "选择产品……", RetailPrice: 0, RetailUnitName: '', WholesalePrice: 0, WholesaleUnitName: '' };
    protected selectedProductId: KnockoutObservable<string> = ko.observable(this.selectOptions.Id);
    protected selectedProduct: KnockoutObservable<any> = ko.observable(this.selectOptions);
    protected productSelected = ko.computed(() => {
        if (this.selectedProduct() && this.selectedProduct().Id !== this.selectOptions.Id)
            return true;
        return false;
    });

    protected selectedProductQuantity: KnockoutObservable<number> = ko.observable(1);
    protected clearSelection = ko.observable(false);

    protected orders = ko.observableArray<Order>([]);
    protected batchId: string = null;
    protected totalNumber: KnockoutObservable<number> = ko.observable(0);
    protected totalPrice: KnockoutObservable<number> = ko.observable(0);

    protected productRepository = new ProductRepository();
    protected orderRepository = new OrderRepository();

    protected onSelectionChanged: (newValue: string) => void;

    protected orderQuantitySubscriptions: Array<KnockoutSubscription> = [];
    protected invalidOrderCount: KnockoutObservable<number> = ko.observable(0);
    protected numberOnlyRegExp = /^\d+$/;

    protected selectedProductPrice: KnockoutObservable<number> = ko.observable(0);

    constructor() {
        super();
        this.back = Navigator.instance.goHome;
    }

    public initialize() {
        let productRepository: ProductRepository = new ProductRepository();
        productRepository.getAll((transaction: SqlTransaction, resultSet: SqlResultSet) => {
            this.products([]); // First, clear products collection
            let rows = resultSet.rows;
            let array = [];
            this.dict = {};
            for (let i = 0; i < rows.length; i++) {
                //this.products.push(new Product(rows.item(i)));
                array.push(new Product(rows.item(i)));
                this.dict[(<any>(rows.item(i))).Id] = rows.item(i);
            }

            array.splice(0, 0, this.selectOptions);
            this.dict[this.selectOptions.Id] = this.selectOptions;

            this.products(array);
        }, this.onDBError);
    }

    protected addOrderWithSpecifiedPrice = (price: number, type: OrderTypes) => {
        if (this.batchId == null) this.batchId = Utils.guid();
        let isNew = true;
        for (let i = 0; i < this.orders().length; i++) {
            if (this.orders()[i].product().Id === this.selectedProduct().Id && this.orders()[i].price() === price) {
                // order.total is a ko.computed observable, so, when quantity changed, the total will be updated automatically
                this.orders()[i].quantity(Number(this.orders()[i].quantity()) + Number(this.selectedProductQuantity()));

                // No need to update total price and totoal quantity since the order's subscribeChanged handler will handle them
                //this.totalPrice(Number(this.totalPrice()) + Number(this.selectedProductQuantity() * price));

                isNew = false;
                break;
            }
        }

        if (isNew) {
            let order = new Order(Utils.guid(), this.batchId, this.selectedProduct(), type, this.selectedProductQuantity(), price);

            // Use the custom ko observable function subscribeChanged, refer to the file top code for more details about implementation
            //https://stackoverflow.com/questions/12822954/get-previous-value-of-an-observable-in-subscribe-of-same-observable
            this.orderQuantitySubscriptions.push(order.quantity.subscribeChanged((newValue: any, oldValue: any) => {
                if (this.numberOnlyRegExp.test(newValue) == false) {
                    if (this.numberOnlyRegExp.test(oldValue)) {
                        this.invalidOrderCount(this.invalidOrderCount() + 1);
                    }
                }

                if (this.numberOnlyRegExp.test(newValue)) {
                    if (this.numberOnlyRegExp.test(oldValue) == false) {
                        this.invalidOrderCount(this.invalidOrderCount() - 1);
                    }
                }

                // Have to do such re-calculation even when quantity is invalid, because old value changed even quantity is invalid.
                this.totalNumber(Number(this.totalNumber()) - Number(oldValue) + Number(newValue));
                // JS的小数计算精度问题
                //	https://www.cnblogs.com/weiqt/articles/2642393.html
                //  https://blog.csdn.net/liaodehong/article/details/51558292
                this.totalPrice(Number((Number(this.totalPrice()) - Number(oldValue * order.price()) + Number(newValue * order.price())).toFixed(2)));
            }, null, order));

            this.orders.push(order);
            // For new added order, manually updte total number and total price for the first time
            this.totalNumber(Number(this.totalNumber()) + Number(this.selectedProductQuantity()));

            // JS的小数计算精度问题
            //	https://www.cnblogs.com/weiqt/articles/2642393.html
            //  https://blog.csdn.net/liaodehong/article/details/51558292
            this.totalPrice(Number((Number(this.totalPrice()) + Number(order.total())).toFixed(2)));
        }

        this.cancelOrderAdding();
    }

    protected addOrder: () => void;

    protected cancelOrderAdding = () => {
        this.selectedProductId(this.selectOptions.Id);
        this.clearSelection(true);
        this.selectedProductQuantity(1);
    }

    protected increaseQuantity = () => {
        this.selectedProductQuantity(Number(this.selectedProductQuantity()) + 1);
    }

    protected decreaseQuantity = () => {
        if (Number(this.selectedProductQuantity()) > 0)
            this.selectedProductQuantity(Number(this.selectedProductQuantity()) - 1);
    }

    protected increaseOrderProductQuantity = (order: Order) => {
        order.quantity(Number(order.quantity()) + 1);

        // No need to do this because the order's subscribeChanged handler will handle them
        //this.totalNumber(Number(this.totalNumber()) + 1);
        //this.totalPrice(Number(this.totalPrice()) + Number(order.price()));
    }

    protected decreaseOrderProductQuantity = (order: Order) => {
        if (Number(order.quantity()) > 0) {
            order.quantity(Number(order.quantity()) - 1);

            // No need to do this because the order's subscribeChanged handler will handle them
            //this.totalNumber(Number(this.totalNumber()) - 1);
            //this.totalPrice(Number(this.totalPrice()) - Number(order.price()));
        }
    }

    protected deleteOrder = (order: Order) => {
        this.orders.remove(order);
        if (order.quantity() < 0)
            this.invalidOrderCount(this.invalidOrderCount() - 1);

        this.totalNumber(Number(this.totalNumber()) - Number(order.quantity()))
        this.totalPrice(Number(this.totalPrice()) - Number(order.total()));
    }

    protected cancelOrders = () => {
        this.orders([]);
        this.totalNumber(0);
        this.totalPrice(0);
        this.batchId = null;
        this.cancelOrderAdding();
        this.invalidOrderCount(0);
    }

    protected save: () => void;

    protected onDBError: (transaction: SqlTransaction, sqlError: SqlError) => void;
}