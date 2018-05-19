import { PageBase } from './PageBase';
import { Navigator } from '../Navigator';
import * as Consts from './Consts';
import { Product } from '../Models/product';
import { ProductRepository } from '../Repositories/ProductRepository';

export class ImportProduct extends PageBase {
    private navigator: Navigator = Navigator.instance;
    private products: KnockoutObservableArray<Product> = ko.observableArray([]);
    private selectedProduct: KnockoutObservable<string> = ko.observable(null);

    constructor() {
        super();
        this.title = ko.observable("进货");
        this.pageId = Consts.Pages.ImportProduct.Id;
        this.back = Navigator.instance.goHome;
    }

    public initialize() {
        let productRepository: ProductRepository = new ProductRepository();
        productRepository.getAll((transaction: SqlTransaction, resultSet: SqlResultSet) => {
            this.products([]); // First, clear products collection
            let rows = resultSet.rows;
            let array = [];
            for (let i = 0; i < rows.length; i++) {
                //this.products.push(new Product(rows.item(i)));
                array.push(new Product(rows.item(i)));
            }

            this.products(array);
        }, this.onDBError);
    }

    private onDBError = (transaction: SqlTransaction, sqlError: SqlError) => {
        alert("Import Product Page: " + sqlError.message);
    }
}