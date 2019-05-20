import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {CheckOutGuard} from './shared/guards/check-out.guard';

const routes: Routes = [
  {
    path: '',
    loadChildren: './pages/landing/landing.module#LandingModule'
  },
  {
    path: 'about',
    loadChildren: './pages/about/about.module#AboutModule'
  },
  {
    path: 'contact',
    loadChildren: './pages/contact/contact.module#ContactModule'
  },
  {
    path: 'shop',
    loadChildren: './pages/shop/shop.module#ShopModule'
  },
  {
    path: 'product',
    loadChildren: './pages/product/product.module#ProductModule'
  },
  {
    path: 'checkout',
    loadChildren: './pages/checkout/checkout.module#CheckoutModule',
    canActivate: [CheckOutGuard],
    data: {
      hideLayout: true
    }
  },
  {
    path: 'my-profile',
    loadChildren: './pages/profile/profile.module#ProfileModule'
  },
  {
    path: '**',
    loadChildren:
      './pages/page-not-found/page-not-found.module#PageNotFoundModule'
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      scrollPositionRestoration: 'enabled',
      anchorScrolling: 'enabled',
      // Set to true for debugging
      enableTracing: false
    })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
