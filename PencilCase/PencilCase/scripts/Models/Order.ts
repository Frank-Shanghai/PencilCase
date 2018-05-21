import { Product } from './Product';

export class Order {
    public id: KnockoutObservable<string>;
    public batchId: KnockoutObservable<string>;
    public productId: KnockoutObservable<string>;
    public product: KnockoutObservable<Product>;
    public type: KnockoutObservable<number>;
    public price: KnockoutObservable<number>;
    public unitId: KnockoutObservable<string>;
    public unitName: KnockoutObservable<string>;
    public total: KnockoutComputed<number>;
    public quantity: KnockoutObservable<number>;
    public createdDate: Date;
    public modifiedDate: Date;

    constructor(id: string, batchId: string, product: Product, type: number, quantity: number, price?: number) {
        this.id = ko.observable(id);
        this.batchId = ko.observable(batchId);
        this.productId = ko.observable(product.Id);
        this.product = ko.observable(product);
        this.type = ko.observable(type);
        switch (type) {
            case OrderTypes.Retail:
                this.price = ko.observable(product.RetailPrice);
                this.unitId = ko.observable(product.RetailUnit);
                this.unitName = ko.observable(product.RetailUnitName);
                break;
            case OrderTypes.Wholesale:
                this.price = ko.observable(product.WholesalePrice);
                this.unitId = ko.observable(product.WholesaleUnit);
                this.unitName = ko.observable(product.WholesaleUnitName);
                break;
            case OrderTypes.Import:
                this.price = ko.observable(price ? price : 0);
                this.unitId = ko.observable(product.RetailUnit);
                this.unitName = ko.observable(product.RetailUnitName);
                break;
        }
        this.quantity = ko.observable(quantity);
        this.total = ko.computed(() => {
            return this.price() * this.quantity();
        });

        this.createdDate = new Date(Date.now());
        this.modifiedDate = new Date(Date.now());
    }
}

export enum OrderTypes {
    Retail = 1,
    Wholesale,
    Import
}