import { PageBase } from './PageBase';
import { Navigator } from '../Navigator';
import * as Consts from './Consts';

export class ProductManagement extends PageBase {
    private navigator: Navigator = Navigator.instance;

    constructor() {
        super();
        this.title = ko.observable("Product Management Test");
        this.pageId = "ProductManagement";
    }

    private gotoTest = () => {
        this.navigator.navigateTo("Retail.html", {
            data: {
                pageInfo: Consts.Pages.Retail
            }
        })
    }
}