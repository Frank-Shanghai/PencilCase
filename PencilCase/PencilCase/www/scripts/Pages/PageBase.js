define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var PageBase = (function () {
        function PageBase() {
            this.initialize();
        }
        PageBase.prototype.initialize = function () {
        };
        PageBase.prototype.equals = function (page) {
            //TODO: what is the base logic for pages equlity? 
            // Answer: here we recognize 2 pages as equal pages if they have the same page id
            return page.pageId === this.pageId;
        };
        return PageBase;
    }());
    exports.PageBase = PageBase;
});
//# sourceMappingURL=PageBase.js.map