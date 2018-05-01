var SelectComponentInitialValueBinding = (function () {
    function SelectComponentInitialValueBinding() {
    }
    SelectComponentInitialValueBinding.prototype.update = function (element, valueAccessor, allowBindingAccessor, viewModel, bindingContext) {
        var value = ko.unwrap(valueAccessor());
        if (value) {
            $(element).find("option").removeAttr("selected");
            $(element).find('option[value="' + value + '"]').attr('selected', 'selected');
            $(element).selectmenu("refresh");
        }
    };
    return SelectComponentInitialValueBinding;
}());
Bindings.registerCustomBinding("selectComponentInitialValue", new SelectComponentInitialValueBinding());
//# sourceMappingURL=SelectComponentInitialValueBinding.js.map