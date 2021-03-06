import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';
import {MetaResolver} from '../../shared/resolvers/meta.resolver';
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
        component: NewsComponent,
        data: {
          meta: {
            title: 'News',
            // tslint:disable-next-line
            description: `Follow SANGHAMITRA’s latest news and developments, connect to our instagram account and become a member to gain access to our events`
          }
        },
        resolve: {
          meta: MetaResolver
        }
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
