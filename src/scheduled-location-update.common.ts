//import { Observable } from 'tns-core-modules/data/observable';
//import * as app from 'tns-core-modules/application';
//import * as dialogs from 'tns-core-modules/ui/dialogs';

import { Observable } from '@nativescript/core/data/observable';
import * as app from '@nativescript/core/application';

// export class Common extends Observable {
//   public message: string;

//   constructor() {
//     super();
//     this.message = Utils.SUCCESS_MSG();
//   }

//   public greet() {
//     return "Hello, NS";
//   }
// }

// export class Utils {
//   public static SUCCESS_MSG(): string {
//     let msg = `Your plugin LOC is working on ${app.android ? 'Android' : 'iOS'}.`;

//     setTimeout(() => {
//       dialogs.alert(`${msg} For real. It's really working :)`).then(() => console.log(`Dialog closed.`));
//     }, 2000);

//     return msg;
//   }
// }
