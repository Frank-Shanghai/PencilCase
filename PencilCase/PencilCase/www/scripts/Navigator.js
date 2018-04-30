define(["require", "exports", "./Pages/ProductManagement", "./Pages/ProductEditor", "./Pages/HomePage", "./Pages/Retail", "./application", "./Pages/Consts"], function (require, exports, ProductManagement_1, ProductEditor_1, HomePage_1, Retail_1, application_1, Consts) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Navigator = (function () {
        function Navigator() {
            // TODO: Pop up pages/dialogs handle 
            var _this = this;
            //public navigateTo = (toPage: string | JQuery, options?: any) => {
            // In JQuery Mobiel doc, the toPage can be string or JQuery object, but for my case,
            // the navigation only works with JQuery object, it must be due to the navigation ways I implemented.
            // So I restraint the type to be JQuery object here to avoid spending time on debugging.
            // Whatever, I don't want to spend more time on it since it already took me much time to make everything works as it does currently
            this.navigateTo = function (pageInfo, options) {
                var jqueryPage = $("div#" + pageInfo.Id).first();
                if (!options)
                    options = {};
                if (!options.data)
                    options.data = {};
                $.extend(options.data, { pageInfo: pageInfo });
                ($).mobile.changePage(jqueryPage, options);
            };
            this.goHome = function () {
                application_1.Application.instance.activePage(new HomePage_1.HomePage());
                $(':mobile-pagecontainer').pagecontainer("change", "#HomePage");
            };
            this.initialize = function () {
                $(':mobile-pagecontainer').on("pagecontainerbeforechange", function (eventObject, parameters) {
                    if (parameters.toPage !== Consts.Pages.HomePage.Id) {
                        if ((parameters.options && parameters.options.data)) {
                            var data = parameters.options.data;
                            if (application_1.Application.instance.activePage().pageId !== data.pageInfo.Id) {
                                // Since this page before change event will be called 2 times, so add code here to avoid set active page 2 times
                                var page = _this.getPage(data);
                                if (data.refresh) {
                                    // If have refresh parameter and value is true, refresh the target page
                                    page.initialize();
                                }
                                application_1.Application.instance.activePage(page);
                            }
                        }
                    }
                    else {
                        application_1.Application.instance.activePage(application_1.Application.instance.homePage());
                    }
                });
                $(':mobile-pagecontainer').pagecontainer({
                    beforeshow: function (eventObject, ui) {
                        if (!application_1.Application.instance.activePage().equals(application_1.Application.instance.homePage())) {
                            // http://demos.jquerymobile.com/1.3.2/faq/injected-content-is-not-enhanced.html
                            // https://www.gajotres.net/jquery-mobile-and-how-to-enhance-the-markup-of-dynamically-added-content/
                            $("body").pagecontainer("getActivePage").trigger("create");
                        }
                    }
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
        Navigator.prototype.getPage = function (data) {
            var pageInfo = data.pageInfo;
            var page;
            var pageExisted = false;
            switch (pageInfo) {
                case Consts.Pages.ProductManagement:
                    page = this.getExistedInstance(pageInfo);
                    pageExisted = !(page == null);
                    if (pageExisted == false)
                        page = new ProductManagement_1.ProductManagement();
                    break;
                case Consts.Pages.ProductEditor:
                    page = this.getExistedInstance(pageInfo);
                    pageExisted = !(page == null);
                    if (pageExisted == false)
                        page = new ProductEditor_1.ProductEditor(data.parameters);
                    break;
                case Consts.Pages.Retail:
                    page = this.getExistedInstance(pageInfo);
                    pageExisted = !(page == null);
                    if (pageExisted == false)
                        page = new Retail_1.Retail();
                    break;
            }
            if (pageExisted == false && pageInfo.IsPermanent === true)
                application_1.Application.instance.pages.push(page);
            return page;
        };
        Navigator.prototype.getExistedInstance = function (pageInfo) {
            if (pageInfo.IsPermanent == false)
                return null;
            for (var i = 0; i < application_1.Application.instance.pages.length; i++) {
                if (application_1.Application.instance.pages[i].pageId === pageInfo.Id) {
                    return application_1.Application.instance.pages[i];
                }
            }
            return null;
        };
        return Navigator;
    }());
    exports.Navigator = Navigator;
});
//# sourceMappingURL=Navigator.js.map