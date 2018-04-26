import { PageBase } from "./PageBase";
import { Application } from "../application";
import { ProductManagement } from "./ProductManagement";
export class HomePage extends PageBase {

    constructor() {
        super();
        this.pageId = "HomePage";

        this.title = ko.observable("Pencil Case");
        this.footer = ko.observable("@Copyright - Frank")
    }

    private openProductManagementPage() {
        // TODO: Look into more about page events
        // Need to find the appropriate time point to chagne active page value

        //let changeActivePage = (eventObject: any) => {
        //    Application.instance.activePage(new ProductManagement());
        //    $(document).unbind("pagebeforechange", changeActivePage);            
        //};

        //Application.instance.activePage(null);
        //$(document).bind("pagebeforechange", changeActivePage);


        (<any>($)).mobile.changePage("Pages/ProductManagement.html");
    }
}