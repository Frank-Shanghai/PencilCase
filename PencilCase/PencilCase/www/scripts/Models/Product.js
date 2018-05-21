define(["require", "exports", "../Utils"], function (require, exports, Utils) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Product = (function () {
        function Product(product) {
            this.Id = null;
            this.Name = '';
            this.Description = '';
            this.RetailPrice = 0;
            this.RetailUnit = null;
            this.WholesalePrice = 0;
            this.WholesaleUnit = null;
            this.ImportWholesalePrice = 0;
            this.ImportRetailPrice = 0;
            this.WholesaleCost = 0;
            this.RetailCost = 0;
            this.Times = 0;
            this.Inventory = 0;
            this.Image = null;
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
                this.RetailPrice = product.RetailPrice;
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
        return Product;
    }());
    exports.Product = Product;
});
//# sourceMappingURL=Product.js.map