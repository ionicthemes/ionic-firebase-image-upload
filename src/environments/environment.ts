// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  firebase: {
    apiKey: "AIzaSyCH5i2BjvyXkIpF-NsyYDZK3TVx-ifvoQA",
    authDomain: "ionic-contacts-app.firebaseapp.com",
    projectId: "ionic-contacts-app",
    storageBucket: "ionic-contacts-app.appspot.com",
    messagingSenderId: "38298401556",
    appId: "1:38298401556:web:3a7d8eba7b11c5aa74a001"
  },
  appShellConfig: {
    debug: false,
    networkDelay: 500
    // We wait on purpose 1 or 2 secs on local environment when fetching from json to simulate the backend roundtrip.
    // However, in production you should set this delay to 0 in the environment.prod file.
  }
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
