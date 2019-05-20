import {NgModule} from '@angular/core';
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
        component: ContactComponent
      }
    ])
  ]
})
export class ContactModule {}
