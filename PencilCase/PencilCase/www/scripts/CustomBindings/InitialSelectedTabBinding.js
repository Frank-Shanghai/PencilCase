var InitialSelectedTabBinding = (function () {
    function InitialSelectedTabBinding() {
    }
    InitialSelectedTabBinding.prototype.init = function (element, valueAccessor, allowBindingAccessor, viewModel, bindingContext) {
        /*
        // value should be something like {condition: KnockoutObservable<boolean>, selector: string}
        // for condition, once its value set to true, re-set the default active tab by clicking the link (tab header)
        // devs can create a computed observable variable for this binding handler
        */
        var value = ko.unwrap(valueAccessor());
        var condition = value.condition;
        var selector = value.selector;
        var conditionSubscription = null;
        if (ko.isObservable(condition)) {
            var handler_1 = function () {
                var linkElement = $(element).find(selector).first();
                if (linkElement.length != 0) {
                    linkElement.click();
                }
            };
            conditionSubscription = condition.subscribe(function (newValue) {
                if (newValue === true) {
                    handler_1();
                }
            });
            handler_1();
        }
        ko.utils.domNodeDisposal.addDisposeCallback(element, function () {
            if (conditionSubscription)
                conditionSubscription.dispose();
        });
    };
    return InitialSelectedTabBinding;
}());
Bindings.registerCustomBinding("initialSelectedTab", new InitialSelectedTabBinding());
//# sourceMappingURL=InitialSelectedTabBinding.js.map