class InitialSelectedTabBinding implements KnockoutBindingHandler {
    public init(element: any, valueAccessor: () => any, allowBindingAccessor: KnockoutAllBindingsAccessor, viewModel: any, bindingContext: KnockoutBindingContext) {
        /*
        // value should be something like {condition: KnockoutObservable<boolean>, selector: string}
        // for condition, once its value set to true, re-set the default active tab by clicking the link (tab header)
        // devs can create a computed observable variable for this binding handler
        */
        let value = ko.unwrap(valueAccessor());
        let condition = value.condition;
        let selector = value.selector;
        let conditionSubscription: KnockoutSubscription = null;

        if (ko.isObservable(condition)) {
            let handler = () => {
                let linkElement = $(element).find(selector).first();
                if (linkElement.length != 0) {
                    linkElement.click();
                }
            }

            conditionSubscription = condition.subscribe((newValue: any) => {
                if (newValue === true) {
                    handler();
                }
            });

            handler();
        }

        ko.utils.domNodeDisposal.addDisposeCallback(element, () => {
            if (conditionSubscription)
                conditionSubscription.dispose();
        });
    }
}

Bindings.registerCustomBinding("initialSelectedTab", new InitialSelectedTabBinding());
