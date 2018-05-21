import { PageBase } from './PageBase';
import { Navigator } from '../Navigator';
import * as Consts from './Consts';
import { Product } from '../Models/Product';
import { ProductRepository } from '../Repositories/ProductRepository';

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
    private clearSelection = ko.observable(false);

    private selectedProducts = ko.observableArray([]);

    constructor() {
        super();
        this.title = ko.observable("进货");
        this.pageId = Consts.Pages.ImportProduct.Id;
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
                this.dict[(<any>(rows.item(i))).Id]= rows.item(i);
            }

            array.splice(0, 0, this.selectOptions);
            this.dict[this.selectOptions.Id] = this.selectOptions;

            this.products(array);
        }, this.onDBError);
    }

    private addProduct = () => {
        //Add Product
        let isNew = true;
        for (let i = 0; i < this.selectedProducts().length; i++) {
            if (this.selectedProducts()[i].product.Id === this.selectedProduct().Id) {
                this.selectedProducts()[i].quantity(this.selectedProducts()[i].quantity() + this.selectedProductQuantity());
                isNew = false;
                break;
            }
        }

        if (isNew) {
            this.selectedProducts.push({
                product: this.selectedProduct(),
                quantity: ko.observable(this.selectedProductQuantity()),
                total: 100
            });
        }

        this.cancelProductAdding();
    }

    private cancelProductAdding = () => {
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

    private onDBError = (transaction: SqlTransaction, sqlError: SqlError) => {
        alert("Import Product Page: " + sqlError.message);
    }
}