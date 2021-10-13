import { Capacitor } from "@capacitor/core";
import { getApp } from "firebase/app";
import { Auth, getAuth, initializeAuth } from "firebase/auth";

let auth: Auth;

// Firebase auth needs to be initialized manually on iOS because the default getAuth() function assumes you're in a browser context and automatically includes pieces you need to perform social login.
// Issue https://github.com/firebase/firebase-js-sdk/issues/5019#issuecomment-861761505

function selectAuthDependingOnEnv(): Auth {
  if (auth) {
    return auth;
  }
  else {
    if (Capacitor.isNativePlatform()) {
      // we wait on purpose 5 secs to make sure that firebase auth has initilized
      setTimeout(() => {
        auth = initializeAuth(getApp());
      }, 5000);
    } else {
      try {
        auth = getAuth();
      } catch (err) {
        console.log(err);
      }
    }
    return auth;
  }
}

export const whichAuth = selectAuthDependingOnEnv();