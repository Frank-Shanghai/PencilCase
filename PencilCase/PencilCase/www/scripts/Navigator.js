define(["require", "exports", "./Pages/ProductManagement", "./Pages/HomePage", "./Pages/Retail", "./application", "./Pages/Consts"], function (require, exports, ProductManagement_1, HomePage_1, Retail_1, application_1, Consts) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Navigator = (function () {
        function Navigator() {
            // TODO: Pop up pages/dialogs handle 
            var _this = this;
            this.navigateTo = function (toPage, options) {
                $("body").pagecontainer("change", toPage, options);
            };
            this.goHome = function () {
                //$("body").pagecontainer("change", $("div#home.ui-page").first(), {
                var path = $.mobile.activePage.data("url");
                var index = path.indexOf(".html");
                var pathWithoutParameters = path.substring(0, index); //not include the end (index postion charactor)
                var depth = -1;
                for (var i = 0; i < pathWithoutParameters.length; i++) {
                    if (pathWithoutParameters[i] === '/')
                        depth++;
                }
                var homePath = "index.html";
                for (var j = 0; j < depth; j++) {
                    homePath = "../" + homePath;
                }
                $("body").pagecontainer("change", homePath, {
                    data: {
                        pageInfo: Consts.Pages.HomePage
                    }
                });
            };
            this.initialize = function () {
                $(document).on("pagebeforechange", function (eventObject, parameters) {
                    if (parameters.options && parameters.options.data) {
                        var data = parameters.options.data;
                        // if options.data is not undefined, means start leaving [FromPage]
                        if (application_1.Application.instance.activePage()) {
                            application_1.Application.instance.activePage().isActive(false);
                            ko.cleanNode($("body").pagecontainer("getActivePage")[0]);
                        }
                        var page = _this.getPage(data.pageInfo);
                        if (data.refresh) {
                            // If have refresh parameter and value is true, refresh the target page
                            page.initialize();
                        }
                        application_1.Application.instance.activePage(page);
                    }
                });
                $(document).on("pagechange", function (eventObject, parameters) {
                    ko.applyBindings(application_1.Application.instance.activePage(), $("body").pagecontainer("getActivePage")[0]);
                    application_1.Application.instance.activePage().isActive(true);
                });
            };
        }
        Object.defineProperty(Navigator, "instance", {
            get: function () {
                if (Navigator._instance == null) {
                    Navigator._instance = new Navigator();
                }
                return Navigator._instance;
            },
            enumerable: true,
            configurable: true
        });
        Navigator.prototype.getPage = function (pageInfo) {
            var page = null;
            switch (pageInfo) {
                case Consts.Pages.HomePage:
                    if (this.needNewInstance(pageInfo, page)) {
                        page = new HomePage_1.HomePage();
                    }
                    break;
                case Consts.Pages.ProductManagement:
                    if (this.needNewInstance(pageInfo, page)) {
                        page = new ProductManagement_1.ProductManagement();
                    }
                    break;
                case Consts.Pages.Retail:
                    if (this.needNewInstance(pageInfo, page)) {
                        page = new Retail_1.Retail();
                    }
                    break;
            }
            if (pageInfo.IsPermanent === true)
                application_1.Application.instance.pages.push(page);
            return page;
        };
        Navigator.prototype.needNewInstance = function (pageInfo, page) {
            if (pageInfo.IsPermanent == false)
                return true;
            for (var i = 0; i < application_1.Application.instance.pages.length; i++) {
                if (application_1.Application.instance.pages[i].pageId === pageInfo.pageId) {
                    page = application_1.Application.instance.pages[i];
                    return false;
                }
            }
            return true;
        };
        return Navigator;
    }());
    exports.Navigator = Navigator;
});
//# sourceMappingURL=Navigator.js.map