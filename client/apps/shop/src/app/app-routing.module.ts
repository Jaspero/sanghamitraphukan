import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {CheckOutGuard} from './shared/guards/check-out.guard';

const routes: Routes = [
  {
    path: '',
    loadChildren: () =>
      import('./pages/landing/landing.module').then(mod => mod.LandingModule)
  },
  {
    path: 'about',
    loadChildren: () =>
      import('./pages/about/about.module').then(mod => mod.AboutModule)
  },
  {
    path: 'news',
    loadChildren: () =>
      import('./pages/news/news.module').then(mod => mod.NewsModule)
  },
  {
    path: 'contact',
    loadChildren: () =>
      import('./pages/contact/contact.module').then(mod => mod.ContactModule)
  },
  {
    path: 'one-horn',
    loadChildren: () =>
      import('./pages/one-horn/one-horn.module').then(mod => mod.OneHornModule)
  },
  {
    path: 'collections',
    loadChildren: () =>
      import('./pages/collections/collections.module').then(
        mod => mod.CollectionsModule
      )
  },
  {
    path: 'shop',
    loadChildren: () =>
      import('./pages/shop/shop.module').then(mod => mod.ShopModule)
  },
  {
    path: 'product',
    loadChildren: () =>
      import('./pages/product/product.module').then(mod => mod.ProductModule)
  },
  {
    path: 'checkout',
    loadChildren: () =>
      import('./pages/checkout/checkout.module').then(
        mod => mod.CheckoutModule
      ),
    canActivate: [CheckOutGuard],
    data: {
      hideLayout: true
    }
  },
  {
    path: 'my-profile',
    loadChildren: () =>
      import('./pages/profile/profile.module').then(mod => mod.ProfileModule)
  },
  {
    path: '**',
    loadChildren: () =>
      import('./pages/page-not-found/page-not-found.module').then(
        mod => mod.PageNotFoundModule
      )
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
