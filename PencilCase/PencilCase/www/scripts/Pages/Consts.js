define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Pages = {
        // Here the permanent means: For these page instances, I will put them into one page collection, in this way, 
        // they can be in the memory and not collected by the GC when active page changed and no references pointing to them.
        // I only keep several ones in the collection like home page, retail and whosale page, for the others, they can be collected by GC automatically
        // And when changing page, there will be one parameter indicates that if need to refresh the page, if so, the page initialize method will be executed.
        HomePage: { Id: "HomePage", IsPermanent: true },
        ProductManagement: { Id: "ProductManagement", IsPermanent: false },
        ProductEditor: { Id: "ProductEditor", IsPermanent: false },
        Retail: { Id: "Retail", IsPermanent: true },
        Whosale: { Id: "Wholesale", IsPermanent: true },
        ImportProduct: { Id: "ImportProduct", IsPermanent: false },
        DataAnalysis: { Id: "DataAnalysis", IsPermanent: false },
        OrderManagement: { Id: "OrderManagement", IsPermanent: false },
        BathOrderDetails: { Id: "BatchOrderDetails", IsPermanent: false },
        ConfirmDialog: { Id: "ConfirmDialog", IsPermanent: false }
    };
});
//# sourceMappingURL=Consts.js.map