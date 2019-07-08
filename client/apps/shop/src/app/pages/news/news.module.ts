import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';
import {SharedModule} from '../../shared/shared.module';
import {NewsSingleComponent} from './news-single/news-single.component';
import {NewsComponent} from './news.component';
import {NewResolver} from './resolvers/new.resolver';

@NgModule({
  declarations: [NewsComponent, NewsSingleComponent],
  providers: [NewResolver],
  imports: [
    SharedModule,
    RouterModule.forChild([
      {
        path: '',
        component: NewsComponent
      },
      {
        path: ':id',
        component: NewsSingleComponent,
        resolve: {
          news: NewResolver
        }
      }
    ])
  ]
})
export class NewsModule {}
