import { PageBase } from "./PageBase";
import { Application } from "../application";
import { ProductManagement } from "./ProductManagement";
import * as Consts from "./Consts";
import { Navigator } from '../Navigator';
import {Retail} from './Retail';

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

    private openProductManagementPage = () => {
        //this.navigator.navigateTo("Pages/ProductManagement.html", {
        this.navigator.navigateTo($("div#ProductManagement").first(), {
            data: {
                pageInfo: Consts.Pages.ProductManagement
            },
            changeHash: false,
            dataUrl: "ProdutManagement"
        });
    }

    private openRetailPage = () => {
        //this.navigator.navigateTo("Pages/Retail.html", {
        this.navigator.navigateTo($("div#Retail").first(), {
            data: {
                pageInfo: Consts.Pages.Retail
            },
            changeHash: false
        });
    }
}