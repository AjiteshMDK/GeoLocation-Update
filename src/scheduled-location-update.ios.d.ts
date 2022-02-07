import { Common } from './scheduled-location-update.common';
export declare class ScheduledLocationUpdate extends Common implements CLLocationManagerDelegate {
    static ObjCProtocols: {
        prototype: CLLocationManagerDelegate;
    }[];
    private locationManager;
    private locationTimer;
    private bgTimer;
    private bgTask;
    constructor();
    startUpdatingLocation(): void;
    locationManagerDidUpdateLocations(manager: CLLocationManager, locations: NSArray<CLLocation>): void;
    locationManagerDidFailWithError(manager: CLLocationManager, error: NSError): void;
    locationManagerDidChangeAuthorizationStatus?(manager: CLLocationManager, status: CLAuthorizationStatus): void;
    private startLocationTimer;
    private stopLocationTimer;
    private startWaitTimer;
    private stopWaitTimer;
    private startBackgroundTask;
    private endBackgroundTask;
    private restartBackgroundTask;
}
