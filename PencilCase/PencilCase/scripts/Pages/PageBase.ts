export class PageBase {
    /*
        Every page should have an Navigator instance, and they do.
        But you can find that I didnot add that field in this base class, that is because Navigator imports other page classes like HomePage, ProductManagement,
        and these classes import this PageBase class, seems it will cause recursive reference issue, what ever, it doens't work for me.
        So, I define the navigator field for each Page manually
    */
    public title: KnockoutObservable<string>;
    public footer: KnockoutObservable<string>;
    public pageId: string;
    public isPermanent: boolean;

    constructor() {
        this.initialize();
    }

    public initialize() {

    }

    public equals(page: PageBase): boolean {
        //TODO: what is the base logic for pages equlity? 
        // Answer: here we recognize 2 pages as equal pages if they have the same page id
        return page.pageId === this.pageId;
    }
}