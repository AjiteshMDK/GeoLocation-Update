import {enums_1} from '@nativescript/core';

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var scheduled_location_update_common_1 = require("./scheduled-location-update.common");
var enums_1 = require("@nativescript/core/ui/enums");
var ScheduledLocationUpdate = (function (_super) {
    __extends(ScheduledLocationUpdate, _super);
    function ScheduledLocationUpdate() {
        var _this_1 = _super.call(this) || this;
        _this_1.locationManager = null;
        _this_1.locationTimer = null;
        _this_1.bgTimer = null;
        _this_1.bgTask = null;
        _this_1.message = "Ajitesh Upadhyaya";
        return _this_1;
    }
    ScheduledLocationUpdate.prototype.startUpdatingLocation = function () {
        if (CLLocationManager.locationServicesEnabled()) {
            this.locationManager = new CLLocationManager();
            this.locationManager.delegate = this;
            this.locationManager.desiredAccuracy = enums_1.Accuracy.high;
            this.locationManager.allowsBackgroundLocationUpdates = true;
            if (CLLocationManager.authorizationStatus() == 3) {
                this.locationManager.startUpdatingLocation();
                this.locationManager.startMonitoringSignificantLocationChanges();
                this.startLocationTimer();
            }
            else {
                this.locationManager.requestAlwaysAuthorization();
            }
        }
    };
    ScheduledLocationUpdate.prototype.locationManagerDidUpdateLocations = function (manager, locations) {
        console.log('locationManagerDidUpdateLocations');
    };
    ScheduledLocationUpdate.prototype.locationManagerDidFailWithError = function (manager, error) {
        console.log('locationManagerDidFailWithError');
    };
    ScheduledLocationUpdate.prototype.locationManagerDidChangeAuthorizationStatus = function (manager, status) {
        console.log('locationManagerDidChangeAuthorizationStatus' + status);
    };
    ScheduledLocationUpdate.prototype.startLocationTimer = function () {
        this.stopLocationTimer();
        this.locationTimer = NSTimer.scheduledTimerWithTimeIntervalTargetSelectorUserInfoRepeats(60, this, "updateLocation", null, true);
    };
    ScheduledLocationUpdate.prototype.stopLocationTimer = function () {
        if (this.locationTimer) {
            console.log("stopLocationTimer");
            this.locationTimer.invalidate();
            this.locationTimer = null;
        }
    };
    ScheduledLocationUpdate.prototype.startWaitTimer = function () {
        console.log("3:startWaitTimer");
        this.stopWaitTimer();
        this.bgTimer = NSTimer.scheduledTimerWithTimeIntervalTargetSelectorUserInfoRepeats(10, this, "startUpdatingLocation", null, true);
    };
    ScheduledLocationUpdate.prototype.stopWaitTimer = function () {
        if (this.bgTimer) {
            console.log("stopWaitTimer");
            this.bgTimer.invalidate();
            this.bgTimer = null;
        }
    };
    ScheduledLocationUpdate.prototype.startBackgroundTask = function (application) {
        console.log("2:startBackgroundTask");
        var _this = this;
        this.startWaitTimer();
        this.bgTask = UIApplication.sharedApplication.beginBackgroundTaskWithExpirationHandler(function () {
            console.log("inside block !!!!");
        });
    };
    ScheduledLocationUpdate.prototype.endBackgroundTask = function (application) {
        application.endBackgroundTask(this.bgTask);
    };
    ScheduledLocationUpdate.prototype.restartBackgroundTask = function (application) {
        console.log("7:restart background task");
        this.endBackgroundTask(application);
        this.startBackgroundTask(application);
    };
    ScheduledLocationUpdate.ObjCProtocols = [CLLocationManagerDelegate];
    return ScheduledLocationUpdate;
}(scheduled_location_update_common_1.Common));
exports.ScheduledLocationUpdate = ScheduledLocationUpdate;
//# sourceMappingURL=scheduled-location-update.ios.js.map