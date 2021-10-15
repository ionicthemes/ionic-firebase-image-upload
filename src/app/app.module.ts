import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { environment } from 'src/environments/environment';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideStorage, getStorage } from "@angular/fire/storage";
import { AngularFireAuthModule } from '@angular/fire/compat/auth';
import { AngularFireModule } from '@angular/fire/compat';
import { provideAuth } from '@angular/fire/auth';
import { whichAuth } from './utils/firebase-auth-helper';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    IonicModule.forRoot(),
    AppRoutingModule,
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideStorage(() => getStorage()),
    // Auth guards are not yet implemented in the new AngularFire so we need to load them from the 'old' modules
    // Issue: https://github.com/angular/angularfire/issues/2986#
    AngularFireModule.initializeApp(environment.firebase),
    AngularFireAuthModule,
    // Firebase auth needs to be initialized manually on iOS because the default getAuth() function assumes you're in a browser context and automatically includes web code that causes errors in iOS.
    // Issue https://github.com/firebase/firebase-js-sdk/issues/5019#issuecomment-861761505
    provideAuth(() => whichAuth)
  ],
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
