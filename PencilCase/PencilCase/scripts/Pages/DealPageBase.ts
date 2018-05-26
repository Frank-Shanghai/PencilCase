import { PageBase } from './PageBase';
import { Navigator } from '../Navigator';
import * as Consts from './Consts';
import { Product } from '../Models/Product';
import { ProductRepository } from '../Repositories/ProductRepository';
import { OrderRepository } from '../Repositories/OrderRepository';
import { Order } from '../Models/Order';
import * as Utils from '../Utils';
import { OrderTypes } from '../Models/Order';

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

    protected addOrderWithSpecifiedPrice = (price: number) => {
        if (this.batchId == null) this.batchId = Utils.guid();
        let isNew = true;
        for (let i = 0; i < this.orders().length; i++) {
            if (this.orders()[i].product().Id === this.selectedProduct().Id) {
                // order.total is a ko.computed observable, so, when quantity changed, the total will be updated automatically
                this.orders()[i].quantity(this.orders()[i].quantity() + this.selectedProductQuantity());
                this.totalPrice(this.totalPrice() + this.selectedProductQuantity() * price)
                isNew = false;
                break;
            }
        }

        if (isNew) {
            let order = new Order(Utils.guid(), this.batchId, this.selectedProduct(), OrderTypes.Import, this.selectedProductQuantity(), price);
            this.orders.push(order);
            this.totalPrice(this.totalPrice() + order.total());
        }

        this.totalNumber(this.totalNumber() + this.selectedProductQuantity());

        this.cancelOrderAdding();
    }

    protected addOrder: () => void;

    protected cancelOrderAdding = () => {
        this.selectedProductId(this.selectOptions.Id);
        this.clearSelection(true);
        this.selectedProductQuantity(1);
    }

    protected increaseQuantity = () => {
        this.selectedProductQuantity(this.selectedProductQuantity() + 1);
    }

    protected decreaseQuantity = () => {
        if (this.selectedProductQuantity() > 0)
            this.selectedProductQuantity(this.selectedProductQuantity() - 1);
    }

    protected increaseOrderProductQuantity = (order: Order) => {
        order.quantity(order.quantity() + 1);
        this.totalNumber(this.totalNumber() + 1);
        // Have the order.price() * 1 here, because the order.praice is string, need this * 1 to make it as a number
        this.totalPrice(this.totalPrice() + order.price() * 1);
    }

    protected decreaseOrderProductQuantity = (order: Order) => {
        if (order.quantity() > 0) {
            order.quantity(order.quantity() - 1);
            this.totalNumber(this.totalNumber() - 1);
            // Have the order.price() * 1 here, because the order.praice is string, need this * 1 to make it as a number
            this.totalPrice(this.totalPrice() - order.price() * 1);
        }
    }

    protected deleteOrder = (order: Order) => {
        this.orders.remove(order);
        this.totalNumber(this.totalNumber() - order.quantity())
        this.totalPrice(this.totalPrice() - order.total());
    }

    protected cancelOrders = () => {
        this.orders([]);
        this.totalNumber(0);
        this.totalPrice(0);
        this.batchId = null;
        this.cancelOrderAdding();
    }

    protected save: () => void;

    protected onDBError: (transaction: SqlTransaction, sqlError: SqlError) => void;
}