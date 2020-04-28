import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {CanDeactivateGuard} from '@jf/guards/can-deactivate.guard';
import {FileUploadModule} from '../../shared/modules/file-upload/file-upload.module';
import {SharedModule} from '../../shared/shared.module';
import {NewsComponent} from './news.component';
import {NewsListComponent} from './pages/list/news-list.component';
import {NewsSinglePageComponent} from './pages/single-page/news-single-page.component';

const routes: Routes = [
  {
    path: '',
    component: NewsComponent,
    children: [
      {path: '', component: NewsListComponent},
      {
        path: ':id',
        component: NewsSinglePageComponent,
        canDeactivate: [CanDeactivateGuard]
      }
    ]
  }
];

@NgModule({
  declarations: [NewsComponent, NewsListComponent, NewsSinglePageComponent],
  imports: [SharedModule, FileUploadModule, RouterModule.forChild(routes)],
  providers: []
})
export class NewsModule {}
