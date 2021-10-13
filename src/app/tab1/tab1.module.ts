import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { Tab1Page } from './tab1.page';
import { ShellModule } from '../utils/shell/shell.module';
import { Tab1Resolver } from './tab1.resolver';

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    ShellModule,
    RouterModule.forChild([
      {
        path: '',
        component: Tab1Page,
        resolve: {
          data: Tab1Resolver
        }
      }
    ])
  ],
  declarations: [Tab1Page],
  providers: [Tab1Resolver]
})
export class Tab1PageModule {}
