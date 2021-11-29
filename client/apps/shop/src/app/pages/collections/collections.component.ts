import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {Collection} from '@jf/interfaces/collection.interface';
import {FirestoreCollections} from '@jf/enums/firestore-collections.enum';
import {STATIC_CONFIG} from '@jf/consts/static-config.const';
import {AngularFirestore} from '@angular/fire/firestore';
import {Observable, Subject} from 'rxjs';
import {map} from 'rxjs/operators';

@Component({
  selector: 'jfs-collections',
  templateUrl: './collections.component.html',
  styleUrls: ['./collections.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CollectionsComponent implements OnInit {
  constructor(private router: Router, private afs: AngularFirestore) {}

  collections$: Observable<Collection[]>;
  featuredCollections$ = new Subject();

  ngOnInit() {
    this.collections$ = this.afs
      .collection<Collection>(
        `${FirestoreCollections.Collections}-${STATIC_CONFIG.lang}`
      )
      .valueChanges({idField: 'id'})
      .pipe(
        map(res => {
          const final = res.reduce(
            (acc, cur) => {
              if (cur.featured) {
                acc.featured.push(cur);
              } else {
                acc.nonFeatured.push(cur);
              }
              return acc;
            },
            {
              featured: [],
              nonFeatured: []
            }
          );
          this.featuredCollections$.next(final.featured);
          return final.nonFeatured;
        })
      );
  }

  goToSingle(collection: string) {
    this.router.navigate(['/shop'], {
      queryParams: {
        collection
      }
    });
  }
}
