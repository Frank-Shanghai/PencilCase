var Bindings = (function () {
    function Bindings() {
    }
    Bindings.registerCustomBinding = function (name, binding, allowVirtualElements) {
        if (allowVirtualElements === void 0) { allowVirtualElements = false; }
        var customHandlers = ko.bindingHandlers;
        customHandlers[name] = binding;
        if (allowVirtualElements) {
            ko.virtualElements.allowedBindings[name] = true;
        }
    };
    return Bindings;
}());
//# sourceMappingURL=Bindings.js.map