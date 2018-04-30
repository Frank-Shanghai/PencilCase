import { PageBase } from './PageBase';
import { Navigator } from '../Navigator';
import * as Consts from './Consts';

export class ProductEditor extends PageBase {
    private navigator: Navigator = Navigator.instance;
    private name: KnockoutObservable<string> = ko.observable('');

    constructor(parameters?: any) {
        super();
        this.title = ko.observable("Product Editor");
        this.pageId = Consts.Pages.ProductEditor.Id;

        if (parameters && parameters.product) {
            this.name = ko.observable(parameters.product.Name);
        }
    }

    private goBack = () => {
        this.navigator.navigateTo(Consts.Pages.ProductManagement, {
            changeHash: false,
            dataUrl: "ProdutManagement"
        });
    }
}