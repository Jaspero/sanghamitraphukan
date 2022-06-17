import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';
import {AngularFirestore} from '@angular/fire/compat/firestore';
import {STATIC_CONFIG} from '@jf/consts/static-config.const';
import {FirestoreCollections} from '@jf/enums/firestore-collections.enum';
import {News} from '@jf/interfaces/news.interface';
import {Observable} from 'rxjs';

@Component({
  selector: 'jfs-news',
  templateUrl: './news.component.html',
  styleUrls: ['./news.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NewsComponent implements OnInit {
  constructor(private afs: AngularFirestore) {}

  news$: Observable<News[]>;

  ngOnInit() {
    this.news$ = this.afs
      .collection<News>(
        `${FirestoreCollections.News}-${STATIC_CONFIG.lang}`,
        ref => {
          return ref.orderBy('createdOn', 'desc').limit(10);
        }
      )
      .valueChanges({idField: 'id'});
  }
}
