import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {FileUploadModule} from '../../shared/modules/file-upload/file-upload.module';
import {SharedModule} from '../../shared/shared.module';
import {CollectionsComponent} from './collections.component';
import {CollectionSinglePageComponent} from './single-page/collection-single-page.component';

const routes: Routes = [
  {
    path: '',
    component: CollectionsComponent
  },
  {
    path: ':id',
    component: CollectionSinglePageComponent
  }
];

@NgModule({
  declarations: [CollectionsComponent, CollectionSinglePageComponent],
  imports: [SharedModule, FileUploadModule, RouterModule.forChild(routes)],
  providers: []
})
export class CollectionsModule {}
