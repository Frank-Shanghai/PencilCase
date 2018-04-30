var ListviewBinding = (function () {
    function ListviewBinding() {
    }
    ListviewBinding.prototype.update = function (element, valueAccessor, allowBindingAccessor, viewModel, bindingContext) {
        var value = valueAccessor();
        if (ko.isObservable(value)) {
            value.subscribe(function (newValue) {
                $(element).listview("refresh");
            });
        }
    };
    return ListviewBinding;
}());
Bindings.registerCustomBinding("listview", new ListviewBinding());
//# sourceMappingURL=ListviewBinding.js.map