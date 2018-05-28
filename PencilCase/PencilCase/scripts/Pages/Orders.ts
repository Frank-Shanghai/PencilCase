import { PageBase } from './PageBase';
import { Navigator } from '../Navigator';
import * as Consts from './Consts';
import { Order } from '../Models/Order';

export class Orders extends PageBase {
    //private navigator: Navigator = Navigator.instance;
    //private batchOrders: KnockoutObservableArray<Product> = ko.observableArray([]);
    //private productRepository: ProductRepository = new ProductRepository();

    //constructor() {
    //    super();
    //    this.title = ko.observable("Product Management");
    //    this.pageId = Consts.Pages.ProductManagement.Id;
    //    this.back = Navigator.instance.goHome;
    //}

    //public initialize() {
    //    let productRepository: ProductRepository = new ProductRepository();
    //    productRepository.getAll((transaction: SqlTransaction, resultSet: SqlResultSet) => {
    //        this.products([]); // First, clear products collection
    //        let rows = resultSet.rows;
    //        for (let i = 0; i < rows.length; i++) {
    //            this.products.push(new Product(rows.item(i)));
    //        }
    //    }, this.onDBError);
    //}

    //private addNewProduct = () => {
    //    this.navigator.navigateTo(Consts.Pages.ProductEditor, {
    //        data: {
    //            parameters: {
    //                product: null
    //            }
    //        },
    //        changeHash: true
    //    });
    //}

    //private showDetails = (product: Product) => {
    //    this.navigator.navigateTo(Consts.Pages.ProductEditor, {
    //        data: {
    //            parameters: {
    //                product: product
    //            }
    //        },
    //        changeHash: true
    //    });
    //}

    //private onDBError = (transaction: SqlTransaction, sqlError: SqlError) => {
    //    alert("Product Management Page: " + sqlError.message);
    //}

}