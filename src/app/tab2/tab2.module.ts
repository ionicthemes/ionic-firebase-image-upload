import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Tab2Page } from './tab2.page';
import { AngularFireAuthGuard } from '@angular/fire/compat/auth-guard';
import { map } from 'rxjs/operators';
import { provideAuth } from '@angular/fire/auth';
import { AngularFireModule } from '@angular/fire/compat';
import { environment } from 'src/environments/environment';
import { AngularFireAuthModule } from '@angular/fire/compat/auth';
import { whichAuth } from '../utils/firebase-auth-helper';

// Firebase guard to redirect logged in private content page
const redirectLoggedInToProfile = (next) => map(user => {
  if (user !== null) {
    return ['tabs/tab2/private-content'];
  } else {
    return true;
  }
});

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFireAuthModule,
    provideAuth(() => whichAuth),
    RouterModule.forChild([
      {
        path: '',
        component: Tab2Page,
        canActivate: [AngularFireAuthGuard],
        data: { authGuardPipe: redirectLoggedInToProfile }
      },
      {
        path: 'private-content',
        loadChildren: () => import('../private-content/private-content.module').then(m => m.PrivateContentModule)
      }
    ])
  ],
  declarations: [Tab2Page]
})
export class Tab2PageModule {}
