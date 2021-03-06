import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  OnInit,
  TemplateRef,
  ViewChild
} from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore } from '@angular/fire/firestore';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { RxDestroy } from '@jaspero/ng-helpers';
import { DYNAMIC_CONFIG } from '@jf/consts/dynamic-config.const';
import { STATIC_CONFIG } from '@jf/consts/static-config.const';
import { FirebaseOperator } from '@jf/enums/firebase-operator.enum';
import { FirestoreCollections } from '@jf/enums/firestore-collections.enum';
import { Category } from '@jf/interfaces/category.interface';
import { Collection } from '@jf/interfaces/collection.interface';
import { Product } from '@jf/interfaces/product.interface';
import * as firebase from 'firebase';
import { BehaviorSubject, forkJoin, of } from 'rxjs';
import { debounceTime, map, switchMap, take, takeUntil, tap } from 'rxjs/operators';
import { CartService } from '../../shared/services/cart/cart.service';
import { StateService } from '../../shared/services/state/state.service';
import FieldPath = firebase.firestore.FieldPath;

@Component({
  selector: 'jfs-products',
  templateUrl: './shop.component.html',
  styleUrls: ['./shop.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ShopComponent extends RxDestroy implements OnInit {
  constructor(
    public cart: CartService,
    public dialog: MatDialog,
    private afAuth: AngularFireAuth,
    private afs: AngularFirestore,
    private fb: FormBuilder,
    private state: StateService,
    private activatedRoute: ActivatedRoute
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

  // .next() anything on this and more products will load
  loadMore$ = new BehaviorSubject<boolean>(null);

  // With BehaviorSubject no twitches during loading of new products
  products$ = new BehaviorSubject([]);

  // Last loaded product, so it is easier to tell firestore startAfter with specific field
  lastProduct: Product = null;

  // When scrolled this close from bottom, load more products
  loadOffset = 1000;

  // Whether there are still products to load from firestore
  productsLeft = true;
  limit = 9;
  chipArray = [];
  categories: Category[];
  collections: Collection[];
  primaryCurrency = DYNAMIC_CONFIG.currency.primary;

  @HostListener('window:scroll', ['$event'])
  onScroll() {
    if (
      window.innerHeight + window.scrollY >=
      document.body.scrollHeight - this.loadOffset &&
      !this.state.loading$.getValue() &&
      this.productsLeft
    ) {
      this.loadMore$.next(true);
    }
  }

  initProducts() {
    this.filters.valueChanges
      .pipe(
        debounceTime(300),
        takeUntil(this.destroyed$)
      )
      .subscribe(() => {
        this.lastProduct = null;
        this.productsLeft = true;
        this.products$.next([]);
        this.loadMore$.next(true);
      });

    this.loadMore$
      .pipe(
        switchMap(() => {
          if (!this.productsLeft) {
            return of([]);
          }

          this.state.loading$.next(true);

          const filters = this.filters.getRawValue();
          return this.afs
            .collection<Product>(
              `${FirestoreCollections.Products}-${STATIC_CONFIG.lang}`,
              ref => {
                let final = ref.where('active', FirebaseOperator.Equal, true);

                this.chipArray = [];

                if (filters.order && filters.order.name) {
                  const type =
                    filters.order.type !== 'price'
                      ? filters.order.type
                      : new FieldPath('price', this.primaryCurrency);

                  final = final.orderBy(type, filters.order.direction);

                  if (filters.order.type === 'price') {
                    final = final.orderBy('name');
                  }
                }

                if (filters.category) {
                  const cat = this.categories.find(x => x.id === filters.category)
                  this.chipArray.push({
                    filter: 'category',
                    value: cat.name
                  });

                  final = final.where(
                    'category',
                    FirebaseOperator.ArrayContains,
                    cat.id
                  );
                }
                if (filters.collection) {
                  const coll = this.collections.find(x => x.id === filters.collection)
                  this.chipArray.push({
                    filter: 'collection',
                    value: coll.name
                  });

                  final = final.where(
                    'collection',
                    FirebaseOperator.Equal,
                    coll.id
                  );
                }
                if (filters.price) {
                  this.chipArray.push({
                    filter: 'price',
                    value: filters.price
                  });

                  final = final.where(
                    'price',
                    FirebaseOperator.LargerThenOrEqual,
                    filters.price
                  );
                }

                final = final.limit(this.limit);

                if (this.lastProduct) {
                  if (filters.order.type === 'price') {
                    final = final.startAfter(
                      this.lastProduct.price[this.primaryCurrency],
                      this.lastProduct.name
                    );
                  } else {
                    final = final.startAfter(
                      this.lastProduct[filters.order.type]
                    );
                  }
                }

                return final;
              }
            )
            .get({
              source: 'server'
            })
            .pipe(tap(() => this.state.loading$.next(false)));
        }),
        map((data: any) => {
          if (data.docs.length === 0) {
            return [];
          }

          const products = data.docs.reduce((acc, cur) => {
            acc.push({
              id: cur.id,
              ...cur.data()
            });
            return acc;
          }, []);

          this.lastProduct = products[products.length - 1];

          return products;
        }),
        tap(data => {
          if (data.length === 0) {
            this.productsLeft = false;
            return;
          }

          if (data.length < this.limit) {
            this.productsLeft = false;
          }

          const newIds = new Set([]);

          data.map(product => {
            newIds.add(product.id);
          });

          // Check for duplicates when Dashboard user changes data
          const oldProducts = this.products$
            .getValue()
            .filter(product => !newIds.has(product.id));

          this.products$.next([...oldProducts, ...data]);

          if (this.state.shopOffset) {
            setTimeout(() => {
              window.scrollTo(0, this.state.shopOffset)
              this.state.shopOffset = 0;
            }, 10);
          }
        })
      )
      .subscribe();
  }

  ngOnInit() {
    this.filters = this.fb.group({});
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

    forkJoin(
      this.afs
        .collection<Category>(
          `${FirestoreCollections.Categories}-${STATIC_CONFIG.lang}`,
          ref => ref.orderBy('order', 'asc')
        )
        .valueChanges({idField: 'id'})
        .pipe(take(1),
          tap(cat => {
          this.categories = cat;
        })),
      this.afs
        .collection<Collection>(
          `${FirestoreCollections.Collections}-${STATIC_CONFIG.lang}`,
          ref => ref.orderBy('order', 'asc')
        )
        .valueChanges({idField: 'id'})
        .pipe(take(1),
          tap(col => {
          this.collections = col;
        }))
    ).pipe().subscribe(res => {
      const query = this.activatedRoute.snapshot.queryParams;
      this.filters = this.fb.group({
        category: query.category || '',
        collection: query.collection || '',
        order: {
          name: 'Name A - Z',
          type: 'order',
          direction: 'asc'
        },
        price: null
      });

      this.initProducts();
    });

  }

  openFilter() {
    this.dialog.open(this.filterDialog, {
      width: '400px'
    });
  }

  resetFilters() {
    this.filters.reset();
  }

  removeChip(chip) {
    this.filters.get(chip.filter).setValue('');
  }
}
