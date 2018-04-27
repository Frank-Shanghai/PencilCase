import { ProductManagement } from './Pages/ProductManagement';
import { PageBase } from './Pages/PageBase';
import { HomePage } from './Pages/HomePage';
import { Retail } from './Pages/Retail';
import { Application } from './application';
import * as Consts from './Pages/Consts';

export class Navigator {
    // TODO: Pop up pages/dialogs handle 

    private static _instance: Navigator;

    public static get instance(): Navigator {
        if (Navigator._instance == null) {
            Navigator._instance = new Navigator();
        }

        return Navigator._instance;
    }

    public navigateTo = (toPage: string | JQuery, options?: any) => {
        $("body").pagecontainer("change", toPage, options);
    }

    public goHome = () => {
        //$("body").pagecontainer("change", $("div#home.ui-page").first(), {
        let path: string = (<any>$).mobile.activePage.data("url");
        let index = path.indexOf(".html");
        let pathWithoutParameters = path.substring(0, index); //not include the end (index postion charactor)
        let depth = -1;
        for (let i = 0; i < pathWithoutParameters.length; i++) {
            if (pathWithoutParameters[i] === '/')
                depth++;
        }

        let homePath = "index.html";
        for (let j = 0; j < depth; j++) {
            homePath = "../" + homePath;
        }

        $("body").pagecontainer("change", homePath, {
            data: {
                pageInfo: Consts.Pages.HomePage
            }
        });
    }

    public initialize = () => {
        $(document).on("pagebeforechange", (eventObject: JQueryEventObject, parameters: any) => {
            if (parameters.options && parameters.options.data) {
                let data = parameters.options.data;

                // if options.data is not undefined, means start leaving [FromPage]
                if (Application.instance.activePage()) {
                    Application.instance.activePage().isActive(false);
                    ko.cleanNode($("body").pagecontainer("getActivePage")[0]);
                }

                let page = this.getPage(data.pageInfo);
                if (data.refresh) {
                    // If have refresh parameter and value is true, refresh the target page
                    page.initialize();
                }

                Application.instance.activePage(page);
            }
        });

        $(document).on("pagechange", (eventObject: JQueryEventObject, parameters: any) => {
            ko.applyBindings(Application.instance.activePage(), $("body").pagecontainer("getActivePage")[0]);
            Application.instance.activePage().isActive(true);
        });
    }

    private getPage(pageInfo: any) {
        let page: PageBase = null;
        switch (pageInfo) {
            case Consts.Pages.HomePage:
                if (this.needNewInstance(pageInfo, page)) {
                    page = new HomePage();
                }
                break;
            case Consts.Pages.ProductManagement:
                if (this.needNewInstance(pageInfo, page)) {
                    page = new ProductManagement();
                }
                break;
            case Consts.Pages.Retail:
                if (this.needNewInstance(pageInfo, page)) {
                    page = new Retail();
                }
                break;
        }

        if (pageInfo.IsPermanent === true)
            Application.instance.pages.push(page);

        return page;
    }

    private needNewInstance(pageInfo: any, page: PageBase) {
        if (pageInfo.IsPermanent == false) return true;

        for (let i = 0; i < Application.instance.pages.length; i++) {
            if (Application.instance.pages[i].pageId === pageInfo.pageId) {
                page = Application.instance.pages[i];
                return false;
            }
        }

        return true;
    }
}