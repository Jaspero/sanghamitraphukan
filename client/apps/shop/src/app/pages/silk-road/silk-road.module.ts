import {NgModule} from '@angular/core';
import {MetaResolver} from '../../shared/resolvers/meta.resolver';
import {SilkRoadComponent} from './silk-road.component';
import {SharedModule} from '../../shared/shared.module';
import {RouterModule} from '@angular/router';

@NgModule({
  declarations: [SilkRoadComponent],
  imports: [
    SharedModule,
    RouterModule.forChild([
      {
        path: '',
        component: SilkRoadComponent,
        data: {
          meta: {
            title: 'SilkRoad',
            description: 'Sanghamitra Silk Road - New Face Hunt'
          }
        },
        resolve: {
          meta: MetaResolver
        }
      }
    ])
  ]
})
export class SilkRoadModule {}
