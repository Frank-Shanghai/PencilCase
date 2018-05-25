import { PageBase } from './PageBase';
import { Navigator } from '../Navigator';
import * as Consts from './Consts';
import { Product } from '../Models/Product';
import { ProductRepository } from '../Repositories/ProductRepository';
import { OrderRepository } from '../Repositories/OrderRepository';
import { Order } from '../Models/Order';
import * as Utils from '../Utils';
import { OrderTypes } from '../Models/Order';

export class ImportProduct extends PageBase {
    private navigator: Navigator = Navigator.instance;
    private products: KnockoutObservableArray<Product> = ko.observableArray([]);
    private dict = {};
    private selectOptions = { Id: "placeholder", Name: "选择产品……", WholesalePrice: 0, WholesaleUnitName: '' };
    private selectedProductId: KnockoutObservable<string> = ko.observable(this.selectOptions.Id);
    private selectedProduct: KnockoutObservable<any> = ko.observable(this.selectOptions);
    private productSelected = ko.computed(() => {
        if (this.selectedProduct() && this.selectedProduct().Id !== this.selectOptions.Id)
            return true;
        return false;
    });

    private selectedProductQuantity: KnockoutObservable<number> = ko.observable(1);
    private selectedProductImportPrice: KnockoutObservable<number> = ko.observable(0);
    private clearSelection = ko.observable(false);

    private importOrders = ko.observableArray<Order>([]);
    private batchId: string = null;
    private totalNumber: KnockoutObservable<number> = ko.observable(0);
    private totalPrice: KnockoutObservable<number> = ko.observable(0);

    private productRepository = new ProductRepository();
    private orderRepository = new OrderRepository();

    constructor() {
        super();
        this.title = ko.observable("进货");
        this.pageId = Consts.Pages.ImportProduct.Id;
        this.back = Navigator.instance.goHome;
        this.selectedProductId.subscribe((newValue: string) => {
            this.selectedProduct(this.dict[newValue]);
            if (this.selectedProduct() && this.selectedProduct().Id !== this.selectOptions.Id) {
                this.selectedProductImportPrice(this.selectedProduct().ImportWholesalePrice ? this.selectedProduct().ImportWholesalePrice : 0);
            }
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
                this.dict[(<any>(rows.item(i))).Id]= rows.item(i);
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
        for (let i = 0; i < this.importOrders().length; i++) {
            if (this.importOrders()[i].product().Id === this.selectedProduct().Id && this.importOrders()[i].price() == this.selectedProductImportPrice()) {
                this.importOrders()[i].quantity(this.importOrders()[i].quantity() + this.selectedProductQuantity());
                this.totalPrice(this.totalPrice() + this.selectedProductQuantity() * this.selectedProductImportPrice())
                isNew = false;
                break;
            }
        }

        if (isNew) {
            let order = new Order(Utils.guid(), this.batchId, this.selectedProduct(), OrderTypes.Import, this.selectedProductQuantity(), this.selectedProductImportPrice());
            this.importOrders.push(order);
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
        this.importOrders.remove(order);
        this.totalNumber(this.totalNumber() - order.quantity())
        this.totalPrice(this.totalPrice() - order.total());
    }

    private cancelOrders = () => {
        this.importOrders([]);
        this.totalNumber(0);
        this.totalPrice(0);
        this.batchId = null;
        this.cancelOrderAdding();
    }

    private save = () => {
        for (let i = 0; i < this.importOrders().length; i++) {
            let order = this.importOrders()[i];
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

    private onDBError = (transaction: SqlTransaction, sqlError: SqlError) => {
        alert("Import Product Page: " + sqlError.message);
    }
}