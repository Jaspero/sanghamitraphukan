import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnInit,
  TemplateRef,
  ViewChild
} from '@angular/core';
import {AngularFireAuth} from '@angular/fire/auth';
import {AngularFirestore} from '@angular/fire/firestore';
import {FormBuilder, FormGroup} from '@angular/forms';
import {MatDialog} from '@angular/material/dialog';
import {RxDestroy} from '@jaspero/ng-helpers';
import {STATIC_CONFIG} from '@jf/consts/static-config.const';
import {FirebaseOperator} from '@jf/enums/firebase-operator.enum';
import {FirestoreCollections} from '@jf/enums/firestore-collections.enum';
import {Category} from '@jf/interfaces/category.interface';
import {Product} from '@jf/interfaces/product.interface';
import {BehaviorSubject, combineLatest, fromEvent, Observable} from 'rxjs';
import {map, scan, startWith, switchMap, takeUntil, tap} from 'rxjs/operators';
import {CartService} from '../../shared/services/cart/cart.service';
import {StateService} from '../../shared/services/state/state.service';

@Component({
  selector: 'jfs-products',
  templateUrl: './shop.component.html',
  styleUrls: ['./shop.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ShopComponent extends RxDestroy implements OnInit, AfterViewInit {
  constructor(
    public cart: CartService,
    public dialog: MatDialog,
    private afAuth: AngularFireAuth,
    private afs: AngularFirestore,
    private fb: FormBuilder,
    private state: StateService
  ) {
    super();
  }

  filters: FormGroup;

  @ViewChild('filterDialog', {static: true})
  filterDialog: TemplateRef<any>;

  @ViewChild('welcomeDialog', {static: true})
  welcomeDialog: TemplateRef<any>;

  @ViewChild('grid', {static: true})
  gridEl: ElementRef<HTMLDivElement>;

  products$: Observable<Product[]>;
  loadMore$ = new BehaviorSubject(null);
  hasMore$ = new BehaviorSubject(true);

  pageSize = 6;
  cursor: any = null;
  chipArray = [];
  categories$: Observable<Array<{id: string; name: string}>>;

  ngOnInit() {
    if (!this.state.shopDialogShown) {
      const showDialogOn = Date.now() - 7 * 24 * 60 * 60 * 1000;
      let welcomeDialogDate: any = localStorage.getItem('welcome-dialog');

      if (welcomeDialogDate) {
        welcomeDialogDate = parseInt(welcomeDialogDate);
      }

      if (!welcomeDialogDate || welcomeDialogDate <= showDialogOn) {
        this.state.shopDialogShown = true;
        localStorage.setItem('welcome-dialog', Date.now().toString());
        this.dialog.open(this.welcomeDialog, {width: '500px'});
      }
    }

    this.filters = this.fb.group({
      category: '',
      order: {name: 'Order', direction: 'asc', type: 'order'},
      price: null
    });

    this.categories$ = this.afs
      .collection<Category>(
        `${FirestoreCollections.Categories}-${STATIC_CONFIG.lang}`,
        ref => ref.orderBy('order', 'asc')
      )
      .valueChanges({idField: 'id'});

    this.products$ = this.filters.valueChanges.pipe(
      startWith(this.filters.getRawValue()),
      switchMap(query => {
        this.hasMore$.next(true);

        this.cursor = null;

        return this.loadMore$.pipe(
          switchMap(() =>
            this.afs
              .collection<Product>(
                `${FirestoreCollections.Products}-${STATIC_CONFIG.lang}`,
                ref => {
                  let final = ref
                    .limit(this.pageSize + 1)
                    .where('active', FirebaseOperator.Equal, true);

                  this.chipArray = [];

                  if (query.order && query.order.name) {
                    final = final.orderBy(
                      query.order.type,
                      query.order.direction
                    );
                  }

                  if (query.category) {
                    this.chipArray.push({
                      filter: 'category',
                      value: query.category.name
                    });

                    final = final.where(
                      'category',
                      FirebaseOperator.ArrayContains,
                      query.category.id
                    );
                  }

                  if (query.price) {
                    this.chipArray.push({
                      filter: 'price',
                      value: query.price
                    });

                    final = final.where(
                      'price',
                      FirebaseOperator.LargerThenOrEqual,
                      query.price
                    );
                  }

                  if (this.cursor) {
                    final = final.startAfter(this.cursor);
                  }
                  return final;
                }
              )
              .snapshotChanges()
          ),
          map(actions => {
            if (actions.length < this.pageSize) {
              this.hasMore$.next(false);
            } else {
              this.cursor = actions[actions.length - 2].payload.doc;
            }
            return actions.reduce((acc, cur, ind) => {
              if (ind < this.pageSize) {
                acc.push({
                  id: cur.payload.doc.id,
                  ...cur.payload.doc.data()
                });
              }
              return acc;
            }, []);
          }),
          scan((acc, curr) => acc.concat(curr), [])
        );
      }),
      tap(() => {
        this.state.loading$.next(false);
      })
    );
  }

  ngAfterViewInit() {
    fromEvent(window, 'scroll')
      .pipe(
        switchMap(() => combineLatest([this.state.loading$, this.hasMore$])),
        takeUntil(this.destroyed$)
      )
      .subscribe(([loading, hasMore]) => {
        if (!loading && hasMore) {
          const trigger =
            this.gridEl.nativeElement.getBoundingClientRect().height +
            this.gridEl.nativeElement.offsetTop;
          const wPos =
            window.innerHeight + (window.scrollY || window.pageYOffset);

          if (trigger <= wPos) {
            this.state.loading$.next(true);
            this.loadMore$.next(null);
          }
        }
      });
  }

  openFilter() {
    this.dialog.open(this.filterDialog, {
      width: '400px'
    });
  }

  removeChip(chip) {
    this.filters.get(chip.filter).setValue('');
  }
}
