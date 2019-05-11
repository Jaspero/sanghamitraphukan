import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  ViewChild
} from '@angular/core';
import {Validators} from '@angular/forms';
import {DYNAMIC_CONFIG} from '@jf/consts/dynamic-config.const';
import {FirestoreCollections} from '@jf/enums/firestore-collections.enum';
import {Category} from '@jf/interfaces/category.interface';
import {GeneralSettings} from '@jf/interfaces/general-settings.interface';
import {Product} from '@jf/interfaces/product.interface';
import {fromStripeFormat, toStripeFormat} from '@jf/utils/stripe-format.ts';
import {Observable} from 'rxjs';
import {map, shareReplay, switchMap, take} from 'rxjs/operators';
import {environment} from '../../../../../../../shop/src/environments/environment';
import {LangSinglePageComponent} from '../../../../shared/components/lang-single-page/lang-single-page.component';
import {CURRENCIES} from '../../../../shared/const/currency.const';
import {URL_REGEX} from '../../../../shared/const/url-regex.const';
import {GalleryUploadComponent} from '../../../../shared/modules/file-upload/gallery-upload/gallery-upload.component';

@Component({
  selector: 'jfsc-single-page',
  templateUrl: './products-single-page.component.html',
  styleUrls: ['./products-single-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductsSinglePageComponent extends LangSinglePageComponent
  implements OnInit {
  @ViewChild(GalleryUploadComponent)
  galleryUploadComponent: GalleryUploadComponent;

  categories$: Observable<Category[]>;
  collection = FirestoreCollections.Products;
  currency: string;
  sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

  ngOnInit() {
    super.ngOnInit();
    this.currency = CURRENCIES.find(
      cur => cur.value === DYNAMIC_CONFIG.currency.primary
    ).symbol;

    this.categories$ = this.state.language$.pipe(
      switchMap(lang =>
        this.afs
          .collection<Category>(`${FirestoreCollections.Categories}-${lang}`)
          .snapshotChanges()
      ),
      map(actions => {
        return actions.map(action => ({
          id: action.payload.doc.id,
          ...action.payload.doc.data()
        }));
      }),
      shareReplay(1)
    );
  }

  // TODO: I think this can be done in a better way
  // move(next = true) {
  //   this.state.language$
  //     .pipe(
  //       switchMap(lang => {
  //         const cursor = this.afs
  //           .collection<Product>(`${FirestoreCollections.Products}-${lang}`)
  //           .doc(this.viewState.Edit).ref;
  //
  //         return this.afs
  //           .collection<Product>(
  //             `${FirestoreCollections.Products}-${lang}`,
  //             ref => {
  //               const final = ref
  //                 .limit(2)
  //                 .orderBy('name', next ? 'desc' : 'asc');
  //
  //               if (next) {
  //                 final.startAfter(cursor);
  //               }
  //
  //               return final;
  //             }
  //           )
  //           .snapshotChanges();
  //       })
  //     )
  //     .subscribe(value => {
  //       if (value && value[1]) {
  //         this.router.navigate(['/products', value[1].payload.doc.id]);
  //       }
  //     });
  // }

  getSaveData(...args) {
    return this.categories$.pipe(
      take(1),
      switchMap(categories => {
        args[1].price = toStripeFormat(args[1].price);
        args[1].search = args[1].name
          .split(' ')
          .map(value => value.trim().toLowerCase());

        if (args[1].category) {
          const category = categories.find(cat => cat.id === args[1].category);

          if (category) {
            args[1].search.push(
              ...category.name
                .split(' ')
                .map(value => value.trim().toLowerCase())
            );
          }
        }

        return this.galleryUploadComponent.save().pipe(
          switchMap(() => {
            args[1].gallery = this.form.get('gallery').value;
            return super.getSaveData(...args);
          })
        );
      })
    );
  }

  buildForm(data: any) {
    this.form = this.fb.group({
      id: [
        {value: data.id, disabled: this.currentState === this.viewState.Edit},
        [Validators.required, Validators.pattern(URL_REGEX)]
      ],
      name: [data.name || '', Validators.required],
      active: data.active || false,
      price: [data.price ? fromStripeFormat(data.price) : 0, Validators.min(0)],
      description: data.description || '',
      shortDescription: data.shortDescription || '',
      gallery: [data.gallery || []],
      quantity: [data.quantity || 0, Validators.min(0)],
      category: data.category,
      showingQuantity:
        data.showingQuantity || DYNAMIC_CONFIG.generalSettings.showingQuantity,
      latest: data.latest || false,
      fabric: data.fabric || '',
      made: data.made || 'Hand Made in India',
      size: [data.size || []],
      instgramLink: data.instgramLink || '',
      preOrder: data.preOrder || false
    });
  }

  view(form) {
    window.open(environment.websiteUrl + '/product/' + form.controls.id.value);
  }
}
