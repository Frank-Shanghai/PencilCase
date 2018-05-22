var CenterPositionBinding = (function () {
    function CenterPositionBinding() {
    }
    CenterPositionBinding.prototype.init = function (element, valueAccessor, allowBindingAccessor, viewModel, bindingContext) {
        var maxTimes = 20; // 2 second
        var options = valueAccessor();
        var $element = $(element);
        var $target;
        // valueAccessor sturctor
        /*
        {
            target: {
                self: boolean;
                relationship: string, // parents, children
                selector: string;
            },
            containerSelector: {
                selector: string
            }
        }
        */
        var handler = function () {
            if (options.target.self === true) {
                $target = $(element);
            }
            else {
                if (options.target.relationship == "parents") {
                    //$element.parents("div.ui-dialog-contain").first();
                    $target = $element.parents(options.target.selector).first();
                }
                if (options.target.relationship == "children") {
                    $target = $element.children(options.target.selector).first();
                }
            }
            if ($($target).length > 0 && $target.height() > 0) {
                var $container = $element.parents(options.containerSelector).first();
                var height = $target.outerHeight(false);
                var containerHeight = $container.outerHeight(false);
                var marginTopValue = (containerHeight - height) / 2;
                $target.css("margin-top", marginTopValue);
            }
            else {
                maxTimes--;
                if (maxTimes > 0) {
                    window.setTimeout(handler, 100);
                }
            }
        };
        window.setTimeout(handler, 100);
    };
    return CenterPositionBinding;
}());
Bindings.registerCustomBinding("centerPosition", new CenterPositionBinding());
//# sourceMappingURL=centerPositionBinding.js.map