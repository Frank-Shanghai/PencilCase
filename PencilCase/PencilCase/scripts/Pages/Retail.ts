import { PageBase } from './PageBase';
import { Navigator } from '../Navigator';
import * as Consts from './Consts';

export class Retail extends PageBase {
    private navigator = Navigator.instance;
    constructor() {
        super();
        this.pageId = Consts.Pages.Retail.Id;
        this.title = ko.observable("Retail");
    }
}