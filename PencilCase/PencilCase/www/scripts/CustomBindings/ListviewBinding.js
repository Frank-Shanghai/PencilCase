var ListviewBinding = (function () {
    function ListviewBinding() {
    }
    ListviewBinding.prototype.init = function (element, valueAccessor, allowBindingAccessor, viewModel, bindingContext) {
        /*
        Implemented listview custom binding handler.
        Due to dynamically inserted(KO binding) DOMs are not enhanced by JQM,
        so need this handler here, once the product collection changed, re-enhance the DOM.

        Note: Note that I did not add any export keyword in this class and the Binding class in Binding.ts.
        In this way, it makes the members in this file are globally available. Just like the JQuery, KO libraries.
        */
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