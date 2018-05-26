import { PageBase } from './PageBase';
import { Navigator } from '../Navigator';
import * as Consts from './Consts';
import { Product } from '../Models/Product';
import { ProductRepository } from '../Repositories/ProductRepository';
import { OrderRepository } from '../Repositories/OrderRepository';
import { Order } from '../Models/Order';
import * as Utils from '../Utils';
import { OrderTypes } from '../Models/Order';

export class Retail extends PageBase {
    private navigator: Navigator = Navigator.instance;
    private products: KnockoutObservableArray<Product> = ko.observableArray([]);
    private dict = {};
    private selectOptions = { Id: "placeholder", Name: "选择产品……", RetailPrice: 0, RetailUnitName: '' };
    private selectedProductId: KnockoutObservable<string> = ko.observable(this.selectOptions.Id);
    private selectedProduct: KnockoutObservable<any> = ko.observable(this.selectOptions);
    private productSelected = ko.computed(() => {
        if (this.selectedProduct() && this.selectedProduct().Id !== this.selectOptions.Id)
            return true;
        return false;
    });

    private selectedProductQuantity: KnockoutObservable<number> = ko.observable(1);
    private clearSelection = ko.observable(false);

    private retailOrders = ko.observableArray<Order>([]);
    private batchId: string = null;
    private totalNumber: KnockoutObservable<number> = ko.observable(0);
    private totalPrice: KnockoutObservable<number> = ko.observable(0);

    private productRepository = new ProductRepository();
    private orderRepository = new OrderRepository();

    constructor() {
        super();
        this.title = ko.observable("零售");
        this.pageId = Consts.Pages.Retail.Id;
        this.back = Navigator.instance.goHome;
        this.selectedProductId.subscribe((newValue: string) => {
            this.selectedProduct(this.dict[newValue]);
        });
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

    private addOrder = () => {
        //Add Product
        if (this.batchId == null) this.batchId = Utils.guid();
        let isNew = true;
        for (let i = 0; i < this.retailOrders().length; i++) {
            if (this.retailOrders()[i].product().Id === this.selectedProduct().Id) {
                // order.total is a ko.computed observable, so, when quantity changed, the total will be updated automatically
                this.retailOrders()[i].quantity(this.retailOrders()[i].quantity() + this.selectedProductQuantity());
                this.totalPrice(this.totalPrice() + this.selectedProductQuantity() * this.selectedProduct().RetailPrice)
                isNew = false;
                break;
            }
        }

        if (isNew) {
            let order = new Order(Utils.guid(), this.batchId, this.selectedProduct(), OrderTypes.Import, this.selectedProductQuantity(), this.selectedProduct().RetailPrice);
            this.retailOrders.push(order);
            this.totalPrice(this.totalPrice() + order.total());
        }

        this.totalNumber(this.totalNumber() + this.selectedProductQuantity());

        this.cancelOrderAdding();
    }

    private cancelOrderAdding = () => {
        this.selectedProductId(this.selectOptions.Id);
        this.clearSelection(true);
        this.selectedProductQuantity(1);
    }

    private increaseQuantity = () => {
        this.selectedProductQuantity(this.selectedProductQuantity() + 1);
    }

    private decreaseQuantity = () => {
        if (this.selectedProductQuantity() > 0)
            this.selectedProductQuantity(this.selectedProductQuantity() - 1);
    }

    private increaseOrderProductQuantity = (order: Order) => {
        order.quantity(order.quantity() + 1);
        this.totalNumber(this.totalNumber() + 1);
        // Have the order.price() * 1 here, because the order.praice is string, need this * 1 to make it as a number
        this.totalPrice(this.totalPrice() + order.price() * 1);
    }

    private decreaseOrderProductQuantity = (order: Order) => {
        if (order.quantity() > 0) {
            order.quantity(order.quantity() - 1);
            this.totalNumber(this.totalNumber() - 1);
            // Have the order.price() * 1 here, because the order.praice is string, need this * 1 to make it as a number
            this.totalPrice(this.totalPrice() - order.price() * 1);
        }
    }

    private deleteOrder = (order: Order) => {
        this.retailOrders.remove(order);
        this.totalNumber(this.totalNumber() - order.quantity())
        this.totalPrice(this.totalPrice() - order.total());
    }

    private cancelOrders = () => {
        this.retailOrders([]);
        this.totalNumber(0);
        this.totalPrice(0);
        this.batchId = null;
        this.cancelOrderAdding();
    }

    private save = () => {
        for (let i = 0; i < this.retailOrders().length; i++) {
            let order = this.retailOrders()[i];
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

    private onDBError = (transaction: SqlTransaction, sqlError: SqlError) => {
        alert("Retail Page: " + sqlError.message);
    }
}