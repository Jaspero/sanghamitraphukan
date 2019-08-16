import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';
import {MetaResolver} from '../../shared/resolvers/meta.resolver';
import {StructuredDataResolver} from '../../shared/resolvers/structured-data.resolver';
import {SharedModule} from '../../shared/shared.module';
import {LandingComponent} from './landing.component';

@NgModule({
  declarations: [LandingComponent],
  imports: [
    SharedModule,
    RouterModule.forChild([
      {
        path: '',
        component: LandingComponent,
        data: {
          meta: {
            title: 'Home',
            description: `The Universal Friend, our latest ‘laid back couture’ and evening wear collections, made from Muga Silk and other precious indigenous fabrics from the Northeast`
          }
        },
        resolve: {
          meta: MetaResolver,
          structuredData: StructuredDataResolver
        }
      }
    ])
  ]
})
export class LandingModule {}
