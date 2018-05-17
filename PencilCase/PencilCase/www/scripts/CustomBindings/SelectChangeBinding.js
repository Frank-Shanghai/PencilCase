var SelectChangeBinding = (function () {
    function SelectChangeBinding() {
    }
    SelectChangeBinding.prototype.init = function (element, valueAccessor, allowBindingAccessor, viewModel, bindingContext) {
        var value = valueAccessor();
        if (ko.isObservable(value)) {
            value.extend({ notify: "always" });
            value.subscribe(function (newValue) {
                if (newValue === true)
                    ko.utils.triggerEvent(element, "change");
            });
        }
    };
    return SelectChangeBinding;
}());
Bindings.registerCustomBinding("selectChange", new SelectChangeBinding());
//# sourceMappingURL=SelectChangeBinding.js.map