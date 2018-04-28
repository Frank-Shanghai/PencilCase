import { ProductManagement } from './Pages/ProductManagement';
import { PageBase } from './Pages/PageBase';
import { HomePage } from './Pages/HomePage';
import { Retail } from './Pages/Retail';
import { Application } from './application';
import * as Consts from './Pages/Consts';

export class Navigator {
    // TODO: Pop up pages/dialogs handle 

    private static _instance: Navigator;
    private tempPage: PageBase;

    public static get instance(): Navigator {
        if (Navigator._instance == null) {
            Navigator._instance = new Navigator();
        }

        return Navigator._instance;
    }

    //public navigateTo = (toPage: string | JQuery, options?: any) => {
    // In JQuery Mobiel doc, the toPage can be string or JQuery object, but for my case,
    // the navigation only works with JQuery object, it must be due to the navigation ways I implemented.
    // So I restraint the type to be JQuery object here to avoid spending time on debugging.
    // Whatever, I don't want to spend more time on it since it already took me much time to make everything works as it does currently
    public navigateTo = (toPage: JQuery, options?: any) => {
        (<any>($)).mobile.changePage(toPage, options);
    }

    public goHome = () => {
        Application.instance.activePage(new HomePage());
        $(':mobile-pagecontainer').pagecontainer("change", "#HomePage");
    }

    public initialize = () => {
        $(':mobile-pagecontainer').on("pagecontainerbeforechange", (eventObject: JQueryEventObject, parameters: any) => {
            if (parameters.toPage !== Consts.Pages.HomePage.Id) { // No need the handling here for home page
                if ((parameters.options && parameters.options.data)) {
                    let data = parameters.options.data;
                    let pp = Application.instance.activePage();
                    if (Application.instance.activePage().pageId !== data.pageInfo.Id) {
                        // Since this page before change event will be called 2 times, so add code here to avoid set active page 2 times
                        let page = this.getPage(data.pageInfo);
                        if (data.refresh) {
                            // If have refresh parameter and value is true, refresh the target page
                            page.initialize();
                        }

                        Application.instance.activePage(page);
                    }
                }
            }
            else {
                Application.instance.activePage(Application.instance.homePage());
            }
        });

        $(':mobile-pagecontainer').pagecontainer({
            beforeshow: (eventObject: JQueryEventObject, ui: any) => {
                if (!Application.instance.activePage().equals(Application.instance.homePage())) {
                    // http://demos.jquerymobile.com/1.3.2/faq/injected-content-is-not-enhanced.html
                    $("body").pagecontainer("getActivePage").trigger("create");
                }
            }
        });
    }

    private getPage(pageInfo: any) {
        let page: PageBase;
        let pageExisted: boolean = false;
        switch (pageInfo) {
            case Consts.Pages.ProductManagement:
                page = this.getExistedInstance(pageInfo);
                pageExisted = !(page == null);
                if (pageExisted == false)
                    page = new ProductManagement();
                break;
            case Consts.Pages.Retail:
                page = this.getExistedInstance(pageInfo);
                pageExisted = !(page == null);
                if (pageExisted == false)
                    page = new Retail();
                break;
        }

        if (pageExisted == false && pageInfo.IsPermanent === true)
            Application.instance.pages.push(page);

        return page;
    }

    private getExistedInstance(pageInfo: any) {
        if (pageInfo.IsPermanent == false) return null;

        for (let i = 0; i < Application.instance.pages.length; i++) {
            if (Application.instance.pages[i].pageId === pageInfo.Id) {
                return Application.instance.pages[i];
            }
        }

        return null;
    }
}