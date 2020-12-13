import {NgModule} from '@angular/core';
import {MetaResolver} from '../../shared/resolvers/meta.resolver';
import {OneHornComponent} from './one-horn.component';
import {SharedModule} from '../../shared/shared.module';
import {RouterModule} from '@angular/router';

@NgModule({
  declarations: [OneHornComponent],
  imports: [
    SharedModule,
    RouterModule.forChild([
      {
        path: '',
        component: OneHornComponent,
        data: {
          meta: {
            title: 'One Horn',
            description: 'Sanghamitra & One Horn Rhino Foundation'
          }
        },
        resolve: {
          meta: MetaResolver
        }
      }
    ])
  ]
})
export class OneHornModule {}
