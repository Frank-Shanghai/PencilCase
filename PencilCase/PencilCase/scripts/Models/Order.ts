﻿import { Product } from './Product';

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
                this.price = ko.observable(price == undefined ? product.RetailPrice : price);
                this.unitId = ko.observable(product.RetailUnit);
                this.unitName = ko.observable(product.RetailUnitName);
                break;
            case OrderTypes.RetailWholesale:
                this.price = ko.observable(price == undefined ? product.RetailWholesalePrice : price);
                this.unitId = ko.observable(product.RetailUnit);
                this.unitName = ko.observable(product.RetailUnitName);
                break;
            case OrderTypes.Wholesale:
                this.price = ko.observable(price == undefined ? product.WholesalePrice : price);
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
            // JS的小数计算精度问题
            //	https://www.cnblogs.com/weiqt/articles/2642393.html
            //  https://blog.csdn.net/liaodehong/article/details/51558292
            return this.price() * 10000 * this.quantity() / 10000;
        });

        this.createdDate = new Date(Date.now());
        this.modifiedDate = new Date(Date.now());
    }
}

export enum OrderTypes {
    Retail = 1,
    Wholesale, //2
    Import, //3
    RetailWholesale //4
}