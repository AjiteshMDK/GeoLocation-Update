
import * as app from "tns-core-modules/application";

export class CustomAppDelegate extends UIResponder implements UIApplicationDelegate {
    public static ObjCProtocols = [UIApplicationDelegate];

    
    public applicationDidEnterBackground?(application: UIApplication): void {
        console.log(":::applicationDidEnterBackground")
    }

    public applicationDidFinishLaunchingWithOptions?(application: UIApplication, launchOptions: NSDictionary<string, any>): boolean {
        console.log(":::applicationDidFinishLaunchingWithOptions")

        return true;
    }

    public applicationDidBecomeActive(application: UIApplication) {
        console.log(":::applicationDidBecomeActive")

    }

    public applicationWillEnterForeground(application: UIApplication){
        console.log(":::applicationWillEnterForeground")

    }
} 