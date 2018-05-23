class ListviewBinding implements KnockoutBindingHandler {
    public init(element: any, valueAccessor: () => any, allowBindingAccessor: KnockoutAllBindingsAccessor, viewModel: any, bindingContext: KnockoutBindingContext) {
        /*
        Implemented listview custom binding handler.
        Due to dynamically inserted(KO binding) DOMs are not enhanced by JQM,
        so need this handler here, once the product collection changed, re-enhance the DOM.

        Note: Note that I did not add any export keyword in this class and the Binding class in Binding.ts.
        In this way, it makes the members in this file are globally available. Just like the JQuery, KO libraries.
        */

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
