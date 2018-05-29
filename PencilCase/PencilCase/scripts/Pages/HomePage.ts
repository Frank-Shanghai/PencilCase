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
        this.navigator.navigateTo(Consts.Pages.ProductManagement, {
            changeHash: true,
        });
    }

    private openRetailPage = () => {
        this.navigator.navigateTo(Consts.Pages.Retail, {
            changeHash: true
        });
    }

    private openWholesalePage = () => {
        this.navigator.navigateTo(Consts.Pages.Whosale, {
            changeHash: true
        });
    }

    private openImportProductPage = () => {
        this.navigator.navigateTo(Consts.Pages.ImportProduct, {
            changeHash: true
        })
    }

    private openOrderManagementPage = () => {
        this.navigator.navigateTo(Consts.Pages.OrderManagement, {
            changeHash: true
        })
    }
}