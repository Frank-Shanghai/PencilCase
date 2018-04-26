import { PageBase } from './PageBase';
export class ProductManagement extends PageBase {
    constructor() {
        super();
        this.title = ko.observable("Product Management Test");
    }
}