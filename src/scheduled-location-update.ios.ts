import * as geolocation from '@nativescript/geolocation';
import { Utils, Application, ApplicationSettings } from '@nativescript/core';
//Utils.Accuracy; // used to describe at what accuracy the location should be get

type LocationData = { service: string, key: string };


//import { Accuracy } from "tns-core-modules/ui/enums";
//import {getBoolean, setBoolean, hasKey, getNumber, setNumber, remove, clear} from "tns-core-modules/application-settings";
//type LocationData = { service: string, key: string };

@NativeClass()
class ScheduledLocationUpdate extends NSObject implements CLLocationManagerDelegate {

    public static ObjCProtocols = [CLLocationManagerDelegate];
    private locationManager: CLLocationManager = null;
    private foregroundLocTimer: NSTimer = null;
    private bgTimer: NSTimer = null;
    private bgTask = null;
    private lastLocation: CLLocation = null;
    private locationPostTimestamp: Date = null;
    private static instance: ScheduledLocationUpdate;
    private isTrackingLocation: boolean = false;
    private handler: any = null;
    private locTimeInterval = 30;
    private action = null;
    private authPromise = null;

    public static ObjCExposedMethods = {
      "updateLocationInBackground": { returns: interop.types.void },
      "updateLocationInForeground": { returns: interop.types.void },
      "applicationDidEnterBackground": { returns: interop.types.void },
      "applicationDidBecomeActive": { returns: interop.types.void }
    };

    public static getInstance() {
      if (!ScheduledLocationUpdate.instance) {
        ScheduledLocationUpdate.instance = new ScheduledLocationUpdate();
        //request permission 
       // geolocation.enableLocationRequest();
        ScheduledLocationUpdate.instance.createLocationManager();
      }
      return ScheduledLocationUpdate.instance;
    }

    /**
     * to check if location service authorised
     */
    public isAuthorized(): boolean {
      this.log("isAuthorized");
      return (CLLocationManager.authorizationStatus() === CLAuthorizationStatus.kCLAuthorizationStatusAuthorized);
    }

    /**
     * request for location authorisations
     */
    public requestAuthorization(): Promise<boolean> {
      this.log("requestAuthorization");
      if (this.isAuthorized()) {
        this.log("requestAuthorization: Authorized will return true");
        return new Promise<boolean>((resolve) => {
          this.log("requestAuthorization: Promise TRUE");
          resolve(true);
        });
      }

      if (!this.locationManager) {
        this.log("requestAuthorization: Creating Location manager");
        this.createLocationManager();
      }

      this.log("requestAuthorization: Not authorized will request authorization");
      return new Promise<boolean>((resolve) => {
        this.log("requestAuthorization: Promise WAIT");
        this.authPromise = resolve;
        this.locationManager.requestAlwaysAuthorization();
      });
    }

    public startUpdatingLocation(interval: number, action: string ): void {
      this.log("startUpdatingLocation");
      this.addNotifications();
      this.locTimeInterval = interval;
      this.action = action;
      this.startLocationTracking();
      this.startLocationUpdate();
    }

    public stopUpdatingLocation(): void {
      this.log("stopUpdatingLocation");
      this.removeNotifications();
      this.stopLocationTracking();
      this.stopLocationUpdate();
    }

    public setEventHandler(handler: any): void {
      this.log("setEventHandler");
      this.handler = handler;
      if (this.handler.executeAction) {
        this.log("setEventHandler: Available");
      }
    }

    //#region -Location Manager
    /**
     * Starts Location update/tracking
     */
    private startLocationTracking(): void {
      this.log("startLocationTracking");
      if (this.locationManager) {
        this.locationManager.startUpdatingLocation();
        this.locationManager.startMonitoringSignificantLocationChanges();
        this.isTrackingLocation = true;
        return;
      }
      this.createLocationManager();
    }

    /**
     * Stop location tracking
     */
    private stopLocationTracking(): void {
      this.log("stopLocationTracking");
      if (this.locationManager) {
          this.locationManager.stopMonitoringSignificantLocationChanges();
          this.locationManager.stopUpdatingLocation();
          this.isTrackingLocation = false;
      }
      this.removeNotifications();
    }

    private startLocationUpdate(): void {
      if (UIApplication.sharedApplication.applicationState === UIApplicationState.Background) {
        this.startBackgroundLocationUpdate(UIApplication.sharedApplication);
        return;
      }
      this.startForegroundLocationUpdate();
    }

    private stopLocationUpdate(): void {
      if (UIApplication.sharedApplication.applicationState === UIApplicationState.Background) {
        this.stopBackgroundLocationUpdate(UIApplication.sharedApplication);
        return;
      }
      this.stopForegroundLocationUpdate();
    }

    /**
     * Initializes location manager
     */
    private createLocationManager(): void {
      this.log("createLocationManager");
      if (CLLocationManager.locationServicesEnabled()) {
        this.locationManager = new CLLocationManager();
        this.locationManager.delegate = this;
        this.locationManager.desiredAccuracy = 3;
        this.locationManager.allowsBackgroundLocationUpdates = true;
        // Get current location with high accuracy
        //geolocation.getCurrentLocation({ desiredAccuracy: Accuracy.high, maximumAge: 5000, timeout: 20000 });
      } else {
        this.log("Location services not enabled");
        // TODO: Navigate to Location settings screen
      }
    }

    //#endregion -Location Manager

    //#region  Location Delegates
    public locationManagerDidUpdateLocations(manager: CLLocationManager, locations: NSArray<CLLocation>): void {
      console.log('EVLibrary:locationManagerDidUpdateLocations');
      this.lastLocation = locations.lastObject;
      console.log(this.lastLocation.coordinate.latitude + "-" + this.lastLocation.coordinate.longitude);
      if (UIApplication.sharedApplication.applicationState === UIApplicationState.Background && (!this.bgTask && !this.bgTimer)) {
        // restart the background task
        console.log("!!!!!!!!!!! Restarting background task from CLLocationManager !!!!!!!!!!!!!!!!!");
        this.startBackgroundLocationUpdate(UIApplication.sharedApplication);
      }
    }

    public locationManagerDidFailWithError(manager: CLLocationManager, error: NSError): void {
       console.log('EVLibrary:locationManagerDidFailWithError');
    }

    public locationManagerDidChangeAuthorizationStatus?(manager: CLLocationManager, status: CLAuthorizationStatus): void {
      console.log('EVLibrary:locationManagerDidChangeAuthorizationStatus' + " " + status);
      if (status === CLAuthorizationStatus.kCLAuthorizationStatusAuthorizedAlways || status === CLAuthorizationStatus.kCLAuthorizationStatusAuthorizedWhenInUse) {
        if (!this.foregroundLocTimer) {
          this.startForegroundLocationUpdate();
        }
        if (this.authPromise) {
          this.authPromise(true);
        }
      }
    }
    //#endregion  Location Delegates

    //#region App Life cycle Notification listners
    private applicationDidEnterBackground(): void {
      let isClockIn = ApplicationSettings.getBoolean("isClockIn");
      if (this.isAuthorized() && isClockIn) {
        this.stopForegroundLocationUpdate();
        this.startBackgroundLocationUpdate(UIApplication.sharedApplication);
      }
    }

    private applicationDidBecomeActive(): void {
      let isClockIn = ApplicationSettings.getBoolean("isClockIn");
      if (this.isAuthorized() && isClockIn) {
        this.stopBackgroundLocationUpdate(UIApplication.sharedApplication);
        this.startForegroundLocationUpdate();
      }
    }
    //#endregion App Life cycle Notification listners

    //#region Foreground LocationUpdate
    /**
     * to start location tracking
     */
    private startForegroundLocationUpdate(): void {
      this.log("startForegroundLocationUpdate");
      if (CLLocationManager.authorizationStatus() === CLAuthorizationStatus.kCLAuthorizationStatusDenied) {
        this.locationManager.requestAlwaysAuthorization();
        return;
      }
      this.startForegroundLocTimer();
    }

    /**
     * stop location tracking in foreground
     */
    private stopForegroundLocationUpdate(): void {
      this.log("stopForegroundLocationUpdate");
      this.stopForegroundLocTimer();
    }

    // Timers
    private startForegroundLocTimer(): void {
      this.log("startForegroundLocTimer");
      this.stopForegroundLocTimer(); // stop location timer if already started
      this.foregroundLocTimer = NSTimer.scheduledTimerWithTimeIntervalTargetSelectorUserInfoRepeats(60, this, "updateLocationInForeground", null, true);
    }

    private stopForegroundLocTimer(): void {
      if (this.foregroundLocTimer) {
        this.log("stopForegroundLocTimer");
        this.foregroundLocTimer.invalidate();
        this.foregroundLocTimer = null;
      }
    }

    private updateLocationInForeground(): void {
      this.stopForegroundLocTimer();
      this.postLocation().then((response)=>{
        this.log("inside post location about to restart");
        this.startForegroundLocTimer();
      });
    }
    //#endregion Foreground LocationUpdate

    //#region Background LocationUpdate
    private startBackgroundLocationUpdate(application: UIApplication): void {
      this.log("startBackgroundLocationUpdate");
      if (CLLocationManager.authorizationStatus() === CLAuthorizationStatus.kCLAuthorizationStatusDenied) {
        return;
      }
      this.startBackgroundTask(application);
    }

    private stopBackgroundLocationUpdate(application: UIApplication): void {
      this.log("stopBackgroundLocationUpdate");
      this.endBackgroundTask(application);
    }

    private startBackgroundTask(application: UIApplication): void {
      this.log("startBackgroundTask");
      let _this = this;
      this.startWaitTimer();
      this.bgTask  = UIApplication.sharedApplication.beginBackgroundTaskWithExpirationHandler(function() {
      });
    }

    private endBackgroundTask(application: UIApplication): void {
      this.log("endBackgroundTask");
      application.endBackgroundTask(this.bgTask);
    }

    private restartBackgroundTask(application: UIApplication): void {
      this.log("restartBackgroundTask");
      this.endBackgroundTask(application);
      this.startBackgroundTask(application);
    }

    private startWaitTimer(): void {
      this.log("startWaitTimer");
      this.stopWaitTimer();
      this.bgTimer = NSTimer.scheduledTimerWithTimeIntervalTargetSelectorUserInfoRepeats(10, this, "updateLocationInBackground", null, true);
    }

    private stopWaitTimer(): void {
      if (this.bgTimer) {
        this.log("stopWaitTimer");
        this.bgTimer.invalidate();
        this.bgTimer = null;
      }
    }

    private updateLocationInBackground(): void {
      if (UIApplication.sharedApplication.applicationState === UIApplicationState.Active) {
        this.endBackgroundTask(UIApplication.sharedApplication);
        this.stopWaitTimer();
        return;
      }
      console.log("EVLibrary:4:startUpdatingLocation", this.lastLocation.coordinate.latitude + "/" + this.lastLocation.coordinate.longitude);
      this.stopWaitTimer();
      this.postLocation().then((response)=>{
        console.log("6:inside post location about to restart");
        this.restartBackgroundTask(UIApplication.sharedApplication);
      });
    }
    //#endregion Background LocationUpdate

    //#region  Network Update
    private postLocation(): any {
      let canPostLoc = this.canPostLocation();
      if (!canPostLoc) {
        console.log("EVLibrary:5:XXXXXXXXX --- postLocation ----- XXXXXXXXXX");
        return new Promise<any>((resolve) => {
          resolve({error: "cannot send loc"});
        });
      }

      if (this.handler && this.action) {
        ApplicationSettings.setNumber("evlatitude", this.lastLocation.coordinate.latitude);
        ApplicationSettings.setNumber("evlongitude", this.lastLocation.coordinate.longitude);
        console.log("EVLibrary:5:XXXXXXXXX --- About to trigger action ----- XXXXXXXXXX");
        return this.handler.executeAction(this.action).then(() => {
          console.log("EVLibrary:5:XXXXXXXXX --- SUCCESS ----- XXXXXXXXXX");
          this.locationPostTimestamp = new Date();
           return true;
        }).catch((failure) => {
          console.log("EVLibrary:5:XXXXXXXXX --- FAILED ----- XXXXXXXXXX");
          this.locationPostTimestamp = new Date();
          return false; // /Promise.reject(clientAPI.localizeText('offline_odata_initialization_failed'));
        });
      }
    }

   //#endregion  Network Update

    //#region  Helper
  private canPostLocation(): boolean {
    if (!this.locationPostTimestamp) {
      this.locationPostTimestamp = new Date();
      return false;
    }
    if (!this.lastLocation) {
      this.locationManager.startUpdatingLocation();
      return false;
    }
    let now = new Date();
    let difference: number = (now.getTime() - this.locationPostTimestamp.getTime())/ 1000;
    this.log("Time difference:" + difference + " " + this.locTimeInterval);
    return (difference > this.locTimeInterval); // greater than 1 minute
  }

  private log(message: String) {
    console.log("EVOLOCPLUGIN " + message);
  }

  private addNotifications() {
    this.removeNotifications();
    NSNotificationCenter.defaultCenter.addObserverSelectorNameObject(this, "applicationDidEnterBackground", UIApplicationDidEnterBackgroundNotification, null);
    NSNotificationCenter.defaultCenter.addObserverSelectorNameObject(this, "applicationDidBecomeActive", UIApplicationDidBecomeActiveNotification, null);
  }

  private removeNotifications() {
    NSNotificationCenter.defaultCenter.removeObserver(this);
  }
  //#endregion Helper

}

export { ScheduledLocationUpdate } 

export function getInstance(): ScheduledLocationUpdate {
  return ScheduledLocationUpdate.getInstance();
}