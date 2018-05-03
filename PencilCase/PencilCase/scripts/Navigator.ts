import { ProductManagement } from './Pages/ProductManagement';
import { ProductEditor } from './Pages/ProductEditor';
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
    public navigateTo = (pageInfo: any, options?: any) => {
        let jqueryPage = $("div#" + pageInfo.Id).first();
        if (!options) options = {};
        $.extend(options, { showLoadMsg: true })
        if (!options.data) options.data = {};
        $.extend(options.data, { pageInfo: pageInfo });

        (<any>($)).mobile.changePage(jqueryPage, options);
    }

    public goHome = () => {
        Application.instance.activePage(new HomePage());
        $(':mobile-pagecontainer').pagecontainer("change", "#" + Consts.Pages.HomePage.Id, { showLoadMsg: true });
    }

    public showConfirmDialog(header: string, content: string, confirm: () => void, cancel?: () => void) {
    Application.instance.confirmDialog({
        header: header,
        content: content,
        confirm: () => {
            if (confirm) {
                confirm();
            }

            Application.instance.confirmDialog(null);
        },
        cancel: () => {
            if (cancel) {
                cancel();
            }

            Application.instance.confirmDialog(null);
        }
    });

    $(':mobile-pagecontainer').pagecontainer("change", "#" + Consts.Pages.ConfirmDialog.Id, { showLoadMsg: true});
}

    public initialize = () => {
    $(':mobile-pagecontainer').on("pagecontainerbeforechange", (eventObject: JQueryEventObject, parameters: any) => {
        if (parameters.toPage !== ('#' + Consts.Pages.HomePage.Id) && parameters.toPage !== ('#' + Consts.Pages.ConfirmDialog.Id)) { // No need the handling here for home page
            if ((parameters.options && parameters.options.data)) {
                let data = parameters.options.data;
                if (Application.instance.activePage().pageId !== data.pageInfo.Id) {
                    // Since this page before change event will be called 2 times, so add code here to avoid set active page 2 times
                    let page = this.getPage(data);
                    if (data.refresh) {
                        // If have refresh parameter and value is true, refresh the target page
                        page.initialize();
                    }

                    Application.instance.activePage(page);
                }
            }
        }
    });

    $(':mobile-pagecontainer').pagecontainer({
        beforeshow: (eventObject: JQueryEventObject, ui: any) => {
            if (!Application.instance.activePage().equals(Application.instance.homePage())) {
                // http://demos.jquerymobile.com/1.3.2/faq/injected-content-is-not-enhanced.html
                // https://www.gajotres.net/jquery-mobile-and-how-to-enhance-the-markup-of-dynamically-added-content/
                $("body").pagecontainer("getActivePage").trigger("create");
            }
        }
    });
}

    private getPage(data: any) {
    let pageInfo = data.pageInfo;

    let page: PageBase;
    let pageExisted: boolean = false;
    switch (pageInfo) {
        case Consts.Pages.ProductManagement:
            page = this.getExistedInstance(pageInfo);
            pageExisted = !(page == null);
            if (pageExisted == false)
                page = new ProductManagement();
            break;
        case Consts.Pages.ProductEditor:
            page = this.getExistedInstance(pageInfo);
            pageExisted = !(page == null);
            if (pageExisted == false)
                page = new ProductEditor(data.parameters);
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