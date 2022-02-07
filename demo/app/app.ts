import * as app from "tns-core-modules/application";
import { CustomAppDelegate } from "./App_Delegates/CustomAppDelegate";
app.run({ moduleName: "app-root" });

/*
Do not place any code after the application has been started as it will not
be executed on iOS.
*/

if (app.ios) {
    // tslint:disable:no-var-requires
    //let customAppDelegate = require('./App_Delegates/CustomAppDelegate');
    app.ios.delegate = CustomAppDelegate;
  }