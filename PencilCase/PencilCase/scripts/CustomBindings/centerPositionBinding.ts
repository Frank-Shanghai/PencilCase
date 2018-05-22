class CenterPositionBinding implements KnockoutBindingHandler {
    public init(element: any, valueAccessor: () => any, allowBindingAccessor: KnockoutAllBindingsAccessor, viewModel: any, bindingContext: KnockoutBindingContext) {
        let maxTimes = 20; // 2 second
        let options = valueAccessor();
        let $element = $(element);
        let $target;

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

        let handler = () => {
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
                let $container = $element.parents(options.containerSelector).first();

                let height = $target.outerHeight(false);
                let containerHeight = $container.outerHeight(false);

                let marginTopValue = (containerHeight - height) / 2;
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
    }
}

Bindings.registerCustomBinding("centerPosition", new CenterPositionBinding());
