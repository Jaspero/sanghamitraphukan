import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {LayoutComponent} from './shared/components/layout/layout.component';
import {AuthGuard} from './shared/guards/auth.guard';
import {LoginGuard} from './shared/guards/login.guard';

const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: 'dashboard',
        loadChildren: () =>
          import('./pages/dashboard/dashboard.module').then(
            mod => mod.DashboardModule
          )
      },
      {
        path: 'products',
        loadChildren: () =>
          import('./pages/products/products.module').then(
            mod => mod.ProductsModule
          )
      },
      {
        path: 'collections',
        loadChildren: () =>
          import('./pages/collections/collections.module').then(
            mod => mod.CollectionsModule
          )
      },
      {
        path: 'categories',
        loadChildren: () =>
          import('./pages/categories/categories.module').then(
            mod => mod.CategoriesModule
          )
      },
      {
        path: 'landing-page',
        loadChildren: () =>
          import('./pages/landing-page/landing-page.module').then(
            mod => mod.LandingPageModule
          )
      },
      {
        path: 'newsletter',
        loadChildren: () =>
          import('./pages/newsletter/newsletter.module').then(
            mod => mod.NewsletterModule
          )
      },
      {
        path: 'orders',
        loadChildren: () =>
          import('./pages/orders/orders.module').then(mod => mod.OrdersModule)
      },
      {
        path: 'customers',
        loadChildren: () =>
          import('./pages/customers/customers.module').then(
            mod => mod.CustomersModule
          )
      },
      {
        path: 'contacts',
        loadChildren: () =>
          import('./pages/contacts/contacts.module').then(
            mod => mod.ContactsModule
          )
      },
      {
        path: 'news',
        loadChildren: () =>
          import('./pages/news/news.module').then(mod => mod.NewsModule)
      },
      {
        path: 'discounts',
        loadChildren: () =>
          import('./pages/discounts/discounts.module').then(
            mod => mod.DiscountsModule
          )
      },
      {
        path: 'gift-cards',
        loadChildren: () =>
          import('./pages/gift-card/gift-cards.module').then(
            mod => mod.GiftCardsModule
          )
      },
      {
        path: 'reviews',
        loadChildren: () =>
          import('./pages/reviews/reviews.module').then(
            mod => mod.ReviewsModule
          )
      },
      {
        path: 'settings',
        loadChildren: () =>
          import('./pages/settings/settings.module').then(
            mod => mod.SettingsModule
          )
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: 'login',
    loadChildren: () =>
      import('./pages/login/login.module').then(mod => mod.LoginModule),
    canActivate: [LoginGuard]
  },
  {
    path: 'reset-password',
    loadChildren: () =>
      import('./pages/reset-password/reset-password.module').then(
        mod => mod.ResetPasswordModule
      ),
    canActivate: [LoginGuard]
  },
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      scrollPositionRestoration: 'top',
      enableTracing: false
    })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
