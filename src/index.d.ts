export declare class ScheduledLocationUpdate {
  public isAuthorized(): boolean 
  public requestAuthorization(): Promise<boolean> 
  public startUpdatingLocation(interval: number, action: string ): void
  public stopUpdatingLocation(): void
  public setEventHandler(handler: any): void
}

export function getInstance(): ScheduledLocationUpdate;
