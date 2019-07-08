import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';
import {SharedModule} from '../../shared/shared.module';
import {NewsComponent} from './news.component';
import {NewsSingleComponent} from './news-single/news-single.component';

@NgModule({
  declarations: [NewsComponent, NewsSingleComponent],
  imports: [
    SharedModule,
    RouterModule.forChild([
      {
        path: '',
        component: NewsComponent
      },
      {
        path: ':id',
        component: NewsSingleComponent
      }
    ])
  ]
})
export class NewsModule {}
