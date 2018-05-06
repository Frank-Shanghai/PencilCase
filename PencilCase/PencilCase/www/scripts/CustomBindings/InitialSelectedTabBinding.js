var InitialSelectedTabBinding = (function () {
    function InitialSelectedTabBinding() {
    }
    InitialSelectedTabBinding.prototype.update = function (element, valueAccessor, allowBindingAccessor, viewModel, bindingContext) {
        /*
        // value should be something like {condition: KnockoutObservable<boolean>, selector: string}
        // for condition, once its value set to true, re-set the default active tab by clicking the link (tab header)
        // devs can create a computed observable variable for this binding handler
        */
        var value = ko.unwrap(valueAccessor());
        var condition = value.condition;
        var selector = value.selector;
        if (ko.isObservable(condition)) {
            var linkElement_1 = $(element).find(selector).first();
            if (linkElement_1.length != 0) {
                condition.subscribe(function (newValue) {
                    if (newValue === true) {
                        linkElement_1.click();
                    }
                });
                linkElement_1.click();
            }
        }
    };
    return InitialSelectedTabBinding;
}());
Bindings.registerCustomBinding("initialSelectedTab", new InitialSelectedTabBinding());
//# sourceMappingURL=InitialSelectedTabBinding.js.map