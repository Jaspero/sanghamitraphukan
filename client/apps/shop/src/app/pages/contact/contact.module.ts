import {NgModule} from '@angular/core';
import {MetaResolver} from '../../shared/resolvers/meta.resolver';
import {ContactComponent} from './contact.component';
import {SharedModule} from '../../shared/shared.module';
import {RouterModule} from '@angular/router';

@NgModule({
  declarations: [ContactComponent],
  imports: [
    SharedModule,
    RouterModule.forChild([
      {
        path: '',
        component: ContactComponent,
        data: {
          meta: {
            title: 'Contact',
            description:
              'Contact us for customised orders, bespoke traditional wear/ silk saris and consultations'
          }
        },
        resolve: {
          meta: MetaResolver
        }
      }
    ])
  ]
})
export class ContactModule {}
