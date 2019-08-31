import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {CheckoutCompleteGuard} from '../../shared/guards/checkout-complete.guard';
import {SharedModule} from '../../shared/shared.module';
import {CheckoutComponent} from './checkout.component';
import {CheckoutErrorComponent} from './checkout-error/checkout-error.component';
import {CheckoutSuccessComponent} from './checkout-success/checkout-success.component';

const routes: Routes = [
  {
    path: '',
    component: CheckoutComponent,
    data: {
      meta: {
        title: 'Checkout',
      }
    }
  },
  {
    path: 'error',
    component: CheckoutErrorComponent,
    canActivate: [CheckoutCompleteGuard],
    data: {
      meta: {
        title: 'Checkout Error',
      }
    }
  },
  {
    path: 'success',
    component: CheckoutSuccessComponent,
    canActivate: [CheckoutCompleteGuard],
    data: {
      meta: {
        title: 'Checkout Success',
      }
    }
  }
];

@NgModule({
  declarations: [
    CheckoutComponent,
    CheckoutErrorComponent,
    CheckoutSuccessComponent
  ],
  imports: [SharedModule, RouterModule.forChild(routes)],
  providers: [CheckoutCompleteGuard]
})
export class CheckoutModule {}
