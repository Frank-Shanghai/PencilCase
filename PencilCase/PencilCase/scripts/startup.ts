﻿import { Application } from './application';

declare var require: (modules: string[], ready: Function, errback: Function) => void;


// Try and load platform-specific code from the /merges folder.
// More info at http://taco.visualstudio.com/en-us/docs/configure-app/#Content.
require(["./platformOverrides"],
    () => Application.instance.initialize(),
    () => Application.instance.onApplicationError());