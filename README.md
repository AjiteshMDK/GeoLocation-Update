# 
# Scheduled Location update ![apple](https://cdn3.iconfinder.com/data/icons/picons-social/57/16-apple-32.png)
Nativescript plugin for MDK app to send location updates in background to SAP.

# dependncy check for nativescript 7
https://blog.nativescript.org/nativescript-7-for-plugin-authors/

# How do i generate plugin ?
Navigate to publish and run the below command to generate plugin 
```
./pack.sh
```

# On execution of above command, if you get permission error then execute following command

sh ./pack.sh

# Installation
In Command prompt / Terminal navigate to your application root folder and run:
```javascript
tns plugin add /Users/mithunk/Desktop/Nativescript/ScheduledLocUpdate/publish/package/nativescript-scheduled-location-update-1.0.2.tgz
```

# Usage 

## AppDelegate Changes
In app delegate import plugin and EventHandler
```javascript
import * as locationUpdate from "nativescript-scheduled-location-update";
import { EventHandler } from 'mdk-core/EventHandler';
```
## Pass EventHandler to plugin
Under application did finish launching function add the below code which sends EventHandler to plugin.
```javascript
    let scheduledLocManager = locationUpdate.getInstance();
    let handler = new EventHandler();
    scheduledLocManager.setEventHandler(handler)
```
Prepare the project before generating iPA file.

## Start location updates
To start the location updates trigger the below function, by passing location time interval and action path to update location.
```javascript
    scheduledLocManager.startUpdatingLocation(60, "/SAPAssetManager/Actions/Location/ZLocationCreateOnlineService.action");
```
## Stop Location updates
To stop the location updates trigger the below function.
```javascript
    scheduledLocManager.stopUpdatingLocation();
```
## Sample source (from MDK rule)
```javascript
    var appSettings = require('application-settings');
    import Logger from '../Log/Logger';
    import * as locationUpdate from "nativescript-scheduled-location-update";
    /**
    * Describe this function...
    * @param {IClientAPI} context
    */
    export default function ZChangeClockInOutStatus(context) {
        let isKeyExists = appSettings.hasKey("isClockIn");
        let isClockIn = appSettings.getBoolean("isClockIn");
        let scheduledLocManager = locationUpdate.getInstance();
        return scheduledLocManager.requestAuthorization().then(result => {
            if(result){
                Logger.info('SAM: Authorised Location');
                if(isKeyExists && isClockIn){
                    Logger.info('isAuthorized: Stopping Location Service');
                    context.getPageProxy().setToolbarItemCaption('IssuePartTbI', context.localizeText('clock_in'));
                    scheduledLocManager.stopUpdatingLocation();
                    return appSettings.setBoolean("isClockIn", false);
                }else{
                    context.getPageProxy().setToolbarItemCaption('IssuePartTbI', context.localizeText('clock_out'));
                    Logger.info('isAuthorized: Starting Location Service');
                    scheduledLocManager.startUpdatingLocation(60, "/SAPAssetManager/Actions/Location/ZLocationCreateOnlineService.action");
                    return appSettings.setBoolean("isClockIn", true);
                }
            }else{
                Logger.info('SAM: Not Authorised Location');
            }
        });
    }
```
## Externals
Add the below keys to externals in WebIDE before deploying the app.
```
application-settings;nativescript-scheduled-location-update
```
## Authorisation Keys
Add the below keys to app plist 
```
NSLocationWhenInUseUsageDescription
NSLocationAlwaysAndWhenInUseUsageDescription
```
## Background Modes
Add the following background modes in Xcode
![alt text](https://bitbucket.org/mithun07/nativescriptlocationplugin/raw/develop/background.png)

## How to add Authorisation Keys/Background Modes(without opening the project in Xcode)
Add the following lines to `Info.plist` located at the path `app/App_Resources/iOS/Info.plist`
```
    <key>UIBackgroundModes</key>
    <array>
      <string>fetch</string>
      <string>location</string>
      <string>processing</string>
    </array>

    <key>NSLocationAlwaysAndWhenInUseUsageDescription</key>
    <string/>
```

# API

| Method | Description |
| --- | --- |
| `isAuthorized(): boolean ` | Checks for location authorization status |
| `public requestAuthorization(): Promise<boolean> ` | Requests for location permission |
| `startUpdatingLocation(interval: number, action: string ): void` | Starts the Location Update and sends location in specified interval to SAP by triggering OData Action |
| `stopUpdatingLocation(): void` | Stops location update |
| `setEventHandler(handler: any): void` | To send EventHandler to plugin from AppDelegate |

# TODO
* ~~Start Location tracking immidiatly after granting/accepting location permissions~~
* ~~Spelling corrections in API~~
* Check with SAP regarding “EventHandler” import in AppDelegate
* Test the plugin in multiple scenarios


