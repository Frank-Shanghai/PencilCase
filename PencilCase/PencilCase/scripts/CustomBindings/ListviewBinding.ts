class ListviewBinding implements KnockoutBindingHandler {
    public init(element: any, valueAccessor: () => any, allowBindingAccessor: KnockoutAllBindingsAccessor, viewModel: any, bindingContext: KnockoutBindingContext) {
        var value = valueAccessor();
        let subscription: KnockoutSubscription = null;
        if (ko.isObservable(value)) {
            subscription = value.subscribe((newValue: any)=>{
                $(element).listview("refresh");
            });
        }

        ko.utils.domNodeDisposal.addDisposeCallback(element, () => {
            if (subscription) subscription.dispose();
        });
    }
}

Bindings.registerCustomBinding("listview", new ListviewBinding());
