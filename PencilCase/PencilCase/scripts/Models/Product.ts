import * as Utils from '../Utils';

export class Product {
    public Id: string = null;
    public Name: string = '';
    public Description: string = '';
    public RetailPrice: number = 0;
    public RetailWholesalePrice: number = 0;
    public RetailUnit: string = null;
    public WholesalePrice: number = 0;
    public WholesaleUnit: string = null;
    public ImportWholesalePrice: number = 0;
    public ImportRetailPrice: number = 0;    
    public WholesaleCost: number = 0;
    public RetailCost: number = 0;
    public Times: number = 0;
    public Inventory: number = 0;
    public Image: any = null;
    public CreatedDate: Date;
    public ModifiedDate: Date;

    public RetailUnitName: string;
    public WholesaleUnitName: string;

    constructor(product?: any) {
        if (product) {
            this.Id = product.Id;
            this.Name = product.Name;
            this.Description = product.Description;
            this.RetailPrice = product.RetailPrice;
            this.RetailUnit = product.RetailUnit;
            this.WholesalePrice = product.WholesalePrice;
            this.WholesaleUnit = product.WholesaleUnit;
            this.ImportWholesalePrice = product.ImportWholesalePrice;
            this.ImportRetailPrice = product.ImportRetailPrice;
            this.WholesaleCost = product.WholesaleCost;
            this.RetailCost = product.RetailCost;
            this.Times = product.Times;
            this.Inventory = product.Inventory;
            this.Image = product.Image;
            this.RetailWholesalePrice = product.RetailWholesalePrice;
            // The returned data with sql lite query is string for date type
            this.CreatedDate = new Date(product.CreatedDate);
            this.ModifiedDate = new Date(product.ModifiedDate);

            this.RetailUnitName = product.RetailUnitName;
            this.WholesaleUnitName = product.WholesaleUnitName;
        }
        else {
            // Create a new product instance
            this.Id = Utils.guid();
            this.CreatedDate = new Date(Date.now());
            this.ModifiedDate = new Date(Date.now());
        }
    }
}