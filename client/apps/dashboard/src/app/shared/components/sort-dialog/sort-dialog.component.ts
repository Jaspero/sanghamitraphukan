import {
  ChangeDetectionStrategy,
  Component,
  Inject,
  OnInit
} from '@angular/core';
import {AngularFirestore} from '@angular/fire/firestore';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {notify} from '@jf/utils/notify.operator';
import {forkJoin, from, Observable, of} from 'rxjs';
import {map, tap} from 'rxjs/operators';
import {SortOptions} from '../../interfaces/sort-options.interface';
import {switchItemLocations} from '../../utils/switch-item-loactions';

@Component({
  selector: 'jfs-sort-dialog',
  templateUrl: './sort-dialog.component.html',
  styleUrls: ['./sort-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SortDialogComponent implements OnInit {
  constructor(
    @Inject(MAT_DIALOG_DATA)
    public options: SortOptions,
    private afs: AngularFirestore,
    private dialogRef: MatDialogRef<SortDialogComponent>
  ) {}

  items$: Observable<any>;
  updateMap: {[key: string]: number} = {};

  ngOnInit() {
    this.items$ = this.afs
      .collection(this.options.collection, ref =>
        ref.orderBy(this.options.sortKey, 'asc')
      )
      .snapshotChanges()
      .pipe(
        map(actions =>
          actions.map(action => ({
            id: action.payload.doc.id,
            ...action.payload.doc.data()
          }))
        )
      );
  }

  move(up = false, items: any[], index: number) {
    const currentIndex = up ? index - 1 : index + 1;
    this.updateMap[items[index].id] = currentIndex;
    this.updateMap[items[currentIndex].id] = index;
    switchItemLocations(items, index, currentIndex);
  }

  update() {
    return () => {
      const data = Object.entries(this.updateMap);

      if (!data.length) {
        return of([]);
      }

      return forkJoin(
        data.map(([id, order]) =>
          from(
            this.afs
              .collection(this.options.collection)
              .doc(id)
              .set(
                {
                  [this.options.sortKey]: order
                },
                {
                  merge: true
                }
              )
          )
        )
      ).pipe(
        notify(),
        tap(() => this.dialogRef.close())
      );
    };
  }
}
