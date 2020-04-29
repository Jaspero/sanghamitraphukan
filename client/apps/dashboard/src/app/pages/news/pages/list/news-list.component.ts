import {Component, OnInit, ChangeDetectionStrategy} from '@angular/core';
import {FirestoreCollections} from '@jf/enums/firestore-collections.enum';
import {News} from '@jf/interfaces/news.interface';
import {LangListComponent} from '../../../../shared/components/lang-list/lang-list.component';

@Component({
  selector: 'jfsc-news-list',
  templateUrl: './news-list.component.html',
  styleUrls: ['./news-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NewsListComponent extends LangListComponent<News>
  implements OnInit {
  displayedColumns = ['checkBox', 'id', 'createdOn', 'title', 'actions'];
  collection = FirestoreCollections.News;

  ngOnInit() {
    super.ngOnInit();
  }
}
