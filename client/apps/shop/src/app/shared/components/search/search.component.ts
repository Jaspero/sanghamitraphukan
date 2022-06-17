import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';
import {AngularFirestore} from '@angular/fire/compat/firestore';
import {UntypedFormControl} from '@angular/forms';
import {Router} from '@angular/router';
import {STATIC_CONFIG} from '@jf/consts/static-config.const';
import {FirebaseOperator} from '@jf/enums/firebase-operator.enum';
import {FirestoreCollections} from '@jf/enums/firestore-collections.enum';
import {Product} from '@jf/interfaces/product.interface';
import {BehaviorSubject, Observable, of} from 'rxjs';
import {debounceTime, map, switchMap, tap} from 'rxjs/operators';
import {MatDialogRef} from '@angular/material/dialog';

@Component({
  selector: 'jfs-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SearchComponent implements OnInit {
  constructor(
    private afs: AngularFirestore,
    private router: Router,
    private dialogRef: MatDialogRef<SearchComponent>
  ) {}

  search: UntypedFormControl;
  products$: Observable<Product[]>;
  loading$ = new BehaviorSubject(false);

  ngOnInit() {
    this.search = new UntypedFormControl('');

    this.search.valueChanges.subscribe(data =>
      this.loading$.next(data.trim() !== '')
    );

    this.products$ = this.search.valueChanges.pipe(
      debounceTime(300),
      switchMap(value => {
        if (value) {
          this.loading$.next(false);

          return this.afs
            .collection<Product>(
              `${FirestoreCollections.Products}-${STATIC_CONFIG.lang}`,
              ref => {
                return ref.where(
                  'search',
                  FirebaseOperator.ArrayContains,
                  value.toLowerCase()
                );
              }
            )
            .valueChanges({idField: 'id'});
        } else {
          return of([]);
        }
      })
    );
  }

  openProduct(product) {
    this.router.navigate(['/product', product.id]);
    this.dialogRef.close();
  }
}
