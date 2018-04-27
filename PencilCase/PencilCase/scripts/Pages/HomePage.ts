import { PageBase } from "./PageBase";
import { Application } from "../application";
import { ProductManagement } from "./ProductManagement";
import * as Consts from "./Consts";
import { Navigator } from '../Navigator';

export class HomePage extends PageBase {
    private navigator: Navigator;

    constructor() {
        super();
        this.pageId = Consts.Pages.HomePage.Id;
        this.isPermanent = Consts.Pages.HomePage.IsPermanent;
        this.navigator = Navigator.instance;
        this.title = ko.observable("Pencil Case");
        this.footer = ko.observable("@Copyright - Frank")
    }

    private openProductManagementPage() {
        this.navigator.navigateTo("Pages/ProductManagement.html", {
            data: {
                pageInfo: Consts.Pages.ProductManagement
            }
        });
    }

    private openRetailPage() {
        this.navigator.navigateTo("Pages/Retail.html", {
            data: {
                pageInfo: Consts.Pages.Retail
            }
        });
    }
}