import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';
import {MetaResolver} from '../../shared/resolvers/meta.resolver';
import {SharedModule} from '../../shared/shared.module';
import {AboutComponent} from './about.component';

@NgModule({
  declarations: [AboutComponent],
  imports: [
    SharedModule,
    RouterModule.forChild([
      {
        path: '',
        component: AboutComponent,
        data: {
          meta: {
            title: 'About us',
            description:
              'We are an Indo-Italian fashion design and lifestyle brand, aiming to Simplify and Re-value Sustainably'
          }
        },
        resolve: {
          meta: MetaResolver
        }
      }
    ])
  ]
})
export class AboutModule {}
