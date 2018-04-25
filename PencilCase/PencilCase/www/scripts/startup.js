define(["require", "exports", "./application"], function (require, exports, application_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    // Try and load platform-specific code from the /merges folder.
    // More info at http://taco.visualstudio.com/en-us/docs/configure-app/#Content.
    require(["./platformOverrides"], function () { return application_1.Application.instance.initialize(); }, function () { return application_1.Application.instance.onApplicationError(); });
});
//# sourceMappingURL=startup.js.map