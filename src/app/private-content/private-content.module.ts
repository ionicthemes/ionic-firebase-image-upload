import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PrivateContentPage } from './private-content.page';
import { PrivateContentResolver } from './private-content.resolver';
import { AngularFireAuthGuard, redirectUnauthorizedTo } from '@angular/fire/compat/auth-guard';
import { IonicModule } from '@ionic/angular';

import { provideAuth } from '@angular/fire/auth';
import { AngularFireModule } from '@angular/fire/compat';
import { environment } from 'src/environments/environment';
import { AngularFireAuthModule } from '@angular/fire/compat/auth';
import { whichAuth } from '../utils/firebase-auth-helper';
import { ShellModule } from '../utils/shell/shell.module';

const redirectUnauthorizedToLogin = () => redirectUnauthorizedTo(['/tabs/tab2']);

@NgModule({
  declarations: [PrivateContentPage],
  imports: [
    CommonModule,
    IonicModule,
    ShellModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFireAuthModule,
    provideAuth(() => whichAuth),
    RouterModule.forChild([
      {
        path: '',
        component: PrivateContentPage,
        canActivate: [AngularFireAuthGuard],
        data: {
          authGuardPipe: redirectUnauthorizedToLogin
        },
        resolve: {
          data: PrivateContentResolver
        }
      }
    ])
  ],
  providers: [PrivateContentResolver]
})
export class PrivateContentModule { }
