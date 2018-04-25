export class PageBase {
    public title: KnockoutObservable<string>;
    public footer: KnockoutObservable<string>;
    public pageId: string;
    public equals(page: PageBase): boolean {
        //TODO: what is the base logic for pages equlity? 
        // Answer: here we recognize 2 pages as equal pages if they have the same page id
        return page.pageId === this.pageId;
    }
}