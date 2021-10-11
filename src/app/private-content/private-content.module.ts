import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PrivateContentPage } from './private-content.page';
import { PrivateContentResolver } from './private-content.resolver';
import { AngularFireAuthGuard, redirectUnauthorizedTo } from '@angular/fire/compat/auth-guard';
import { IonicModule } from '@ionic/angular';
import { ShellModule } from '../shell/shell.module';

import { provideAuth } from '@angular/fire/auth';
import { whichAuth } from '../services/firebase-auth-helper';

const redirectUnauthorizedToLogin = () => redirectUnauthorizedTo(['/tabs/tab2']);

@NgModule({
  declarations: [PrivateContentPage],
  imports: [
    CommonModule,
    IonicModule,
    ShellModule,
    provideAuth(() => whichAuth()),
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
