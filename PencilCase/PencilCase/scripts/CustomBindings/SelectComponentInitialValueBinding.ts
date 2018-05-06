class SelectComponentInitialValueBinding implements KnockoutBindingHandler {
    public update(element: any, valueAccessor: () => any, allowBindingAccessor: KnockoutAllBindingsAccessor, viewModel: any, bindingContext: KnockoutBindingContext) {
        var value = ko.unwrap(valueAccessor());
        if (value) {
            $(element).find("option").removeAttr("selected");
            $(element).find('option[value="' + value + '"]').attr('selected', 'selected');
            $(element).selectmenu("refresh");
        }
    }
}

Bindings.registerCustomBinding("selectComponentInitialValue", new SelectComponentInitialValueBinding());
