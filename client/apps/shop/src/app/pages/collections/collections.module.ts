import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';
import {MetaResolver} from '../../shared/resolvers/meta.resolver';
import {StructuredDataResolver} from '../../shared/resolvers/structured-data.resolver';
import {SharedModule} from '../../shared/shared.module';
import {CollectionsComponent} from './collections.component';

@NgModule({
  declarations: [CollectionsComponent],
  imports: [
    SharedModule,
    RouterModule.forChild([
      {
        path: '',
        component: CollectionsComponent,
        data: {
          meta: {
            title: 'Home',
            // tslint:disable-next-line
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
export class CollectionsModule {}
