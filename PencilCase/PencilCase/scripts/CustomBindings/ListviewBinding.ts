class ListviewBinding implements KnockoutBindingHandler {
    public update(element: any, valueAccessor: () => any, allowBindingAccessor: KnockoutAllBindingsAccessor, viewModel: any, bindingContext: KnockoutBindingContext) {
        var value = valueAccessor();
        if (ko.isObservable(value)) {
            value.subscribe((newValue: any)=>{
                $(element).listview("refresh");
            });
        }
    }
}

Bindings.registerCustomBinding("listview", new ListviewBinding());
