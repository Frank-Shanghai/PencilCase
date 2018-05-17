class SelectChangeBinding implements KnockoutBindingHandler {
    public init(element: any, valueAccessor: () => any, allowBindingAccessor: KnockoutAllBindingsAccessor, viewModel: any, bindingContext: KnockoutBindingContext) {
        let value = valueAccessor();
        if (ko.isObservable(value)) {
            value.extend({ notify: "always" });
            value.subscribe((newValue: any) => {
                if (newValue === true)
                    ko.utils.triggerEvent(element, "change");
            });
        }
    }
}

Bindings.registerCustomBinding("selectChange", new SelectChangeBinding());
