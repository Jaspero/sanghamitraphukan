import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {SharedModule} from '../../shared/shared.module';
import {SingleLandingPageComponent} from './single-landing-page/single-landing-page.component';
import {LandingPageComponent} from './landing-page.component';
import {FileUploadModule} from '../../shared/modules/file-upload/file-upload.module';

const routes: Routes = [
  {
    path: '',
    component: LandingPageComponent
  },
  {
    path: ':id',
    component: SingleLandingPageComponent
  }
];

@NgModule({
  declarations: [LandingPageComponent, SingleLandingPageComponent],
  imports: [SharedModule, FileUploadModule, RouterModule.forChild(routes)]
})
export class LandingPageModule {}
