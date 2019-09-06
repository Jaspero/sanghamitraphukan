import {ChangeDetectionStrategy, Component} from '@angular/core';
import {map, switchMap, take} from 'rxjs/operators';
import {LangListComponent} from '../../shared/components/lang-list/lang-list.component';
import {FirestoreCollections} from '@jf/enums/firestore-collections.enum';
import {LandingPage} from '@jf/interfaces/landing-page.interface';
import {SortDialogComponent} from '../../shared/components/sort-dialog/sort-dialog.component';

@Component({
  selector: 'jfsc-landing-page',
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LandingPageComponent extends LangListComponent<LandingPage> {
  collection = FirestoreCollections.landingPage;
  displayedColumns = [
    'checkBox',
    'id',
    'createdOn',
    'title',
    'category',
    'active',
    'actions'
  ];

  openSort() {
    this.state.language$
      .pipe(
        take(1),
        switchMap(lang => {
          return this.dialog
            .open(SortDialogComponent, {
              width: '400px',
              data: {
                collectionName: 'Landing Pages',
                collection: `${this.collection}-${lang}`,
                sortKey: 'order',
                sortTitle: 'title'
              }
            })
            .afterClosed();
        })
      )
      .subscribe();
  }
}
