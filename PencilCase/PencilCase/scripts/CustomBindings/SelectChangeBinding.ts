class SelectChangeBinding implements KnockoutBindingHandler {
    public init(element: any, valueAccessor: () => any, allowBindingAccessor: KnockoutAllBindingsAccessor, viewModel: any, bindingContext: KnockoutBindingContext) {
        let value = valueAccessor();
        let valueSubscription: KnockoutSubscription = null;

        if (ko.isObservable(value)) {
            value.extend({ notify: "always" });
            valueSubscription = value.subscribe((newValue: any) => {
                if (newValue === true)
                    ko.utils.triggerEvent(element, "change");
            });
        }

        ko.utils.domNodeDisposal.addDisposeCallback(element, () => {
            if (valueSubscription)
                valueSubscription.dispose();
        });
    }
}

Bindings.registerCustomBinding("selectChange", new SelectChangeBinding());
