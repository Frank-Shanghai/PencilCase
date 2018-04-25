import {PageBase} from "./PageBase";
export class HomePage extends PageBase {

    constructor() {
        super();
        this.pageId = "HomePage";

        this.title = ko.observable("Pencil Case");
        this.footer = ko.observable("@Copyright - Frank")
    }
}