var SelectChangeBinding = (function () {
    function SelectChangeBinding() {
    }
    SelectChangeBinding.prototype.init = function (element, valueAccessor, allowBindingAccessor, viewModel, bindingContext) {
        var value = valueAccessor();
        var valueSubscription = null;
        if (ko.isObservable(value)) {
            value.extend({ notify: "always" });
            valueSubscription = value.subscribe(function (newValue) {
                if (newValue === true)
                    ko.utils.triggerEvent(element, "change");
            });
        }
        ko.utils.domNodeDisposal.addDisposeCallback(element, function () {
            if (valueSubscription)
                valueSubscription.dispose();
        });
    };
    return SelectChangeBinding;
}());
Bindings.registerCustomBinding("selectChange", new SelectChangeBinding());
//# sourceMappingURL=SelectChangeBinding.js.map