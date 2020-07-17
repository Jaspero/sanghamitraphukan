import {ChangeDetectionStrategy, Component} from '@angular/core';
import {STATIC_CONFIG} from '@jf/consts/static-config.const';
import {FirestoreCollections} from '@jf/enums/firestore-collections.enum';
import {Category} from '@jf/interfaces/category.interface';
import {LangListComponent} from '../../shared/components/lang-list/lang-list.component';
import {SortDialogComponent} from '../../shared/components/sort-dialog/sort-dialog.component';

@Component({
  selector: 'jfsc-categories',
  templateUrl: './collections.component.html',
  styleUrls: ['./collections.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CollectionsComponent extends LangListComponent<Category> {
  collection = FirestoreCollections.Collections;
  displayedColumns = [
    'checkBox',
    'id',
    'createdOn',
    'name',
    'actions'
  ];

  openSort() {
    this.dialog.open(SortDialogComponent, {
      width: '500px',
      data: {
        title: 'Collection Sort',
        collection: `${FirestoreCollections.Collections}-${STATIC_CONFIG.lang}`
      }
    });
  }
}
