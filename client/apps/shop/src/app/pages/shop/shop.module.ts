import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';
import {MetaResolver} from '../../shared/resolvers/meta.resolver';
import {StructuredDataResolver} from '../../shared/resolvers/structured-data.resolver';
import {SharedModule} from '../../shared/shared.module';
import {ShopComponent} from './shop.component';
import {MatInputModule} from '@angular/material/input';

@NgModule({
  declarations: [ShopComponent],
  imports: [
    MatInputModule,
    SharedModule,
    RouterModule.forChild([
      {
        path: '',
        component: ShopComponent,
        data: {
          meta: {
            title: 'Shop',
            // tslint:disable-next-line
            description: `Browse through and shop our collections of handmade garments, produced through traditional techniques using exclusively natural fabrics`
          },
          structuredData: {
            '@type': 'WebSite',
            name: 'Shop',
            // tslint:disable-next-line
            description: `Browse through and shop our collections of handmade garments, produced through traditional techniques using exclusively natural fabrics`
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
export class ShopModule {}
