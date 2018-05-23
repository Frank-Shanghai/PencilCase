var ListviewBinding = (function () {
    function ListviewBinding() {
    }
    ListviewBinding.prototype.init = function (element, valueAccessor, allowBindingAccessor, viewModel, bindingContext) {
        var value = valueAccessor();
        var subscription = null;
        if (ko.isObservable(value)) {
            subscription = value.subscribe(function (newValue) {
                $(element).listview("refresh");
            });
        }
        ko.utils.domNodeDisposal.addDisposeCallback(element, function () {
            if (subscription)
                subscription.dispose();
        });
    };
    return ListviewBinding;
}());
Bindings.registerCustomBinding("listview", new ListviewBinding());
//# sourceMappingURL=ListviewBinding.js.map