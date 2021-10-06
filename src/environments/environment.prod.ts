export const environment = {
  production: true,
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
    networkDelay: 1000
    // We wait on purpose 1 or 2 secs on local environment when fetching from json to simulate the backend roundtrip.
    // However, in production you should set this delay to 0 in the environment.prod file.
  }
};
