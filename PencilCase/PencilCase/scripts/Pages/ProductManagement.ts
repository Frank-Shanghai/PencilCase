import { PageBase } from './PageBase';
import { Navigator } from '../Navigator';
import * as Consts from './Consts';

export class ProductManagement extends PageBase {
    private navigator: Navigator = Navigator.instance;

    constructor() {
        super();
        this.title = ko.observable("Product Management");
        this.pageId = Consts.Pages.ProductManagement.Id;
    }

    private gotoTest = () => {
        this.navigator.navigateTo($("div#Retail").first(), {
            data: {
                pageInfo: Consts.Pages.Retail
            }
        })
    }
}