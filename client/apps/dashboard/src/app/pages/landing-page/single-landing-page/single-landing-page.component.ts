import {ChangeDetectionStrategy, Component, OnInit, QueryList, ViewChildren} from '@angular/core';
import {FirestoreCollections} from '@jf/enums/firestore-collections.enum';
import {Category} from '@jf/interfaces/category.interface';
import {Product} from '@jf/interfaces/product.interface';
import {forkJoin, Observable} from 'rxjs';
import {map, shareReplay, switchMap, take} from 'rxjs/operators';
import {LangSinglePageComponent} from '../../../shared/components/lang-single-page/lang-single-page.component';
import {ImageUploadComponent} from '../../../shared/modules/file-upload/image-upload/image-upload.component';

@Component({
  selector: 'jfsc-single-landing-page',
  templateUrl: './single-landing-page.component.html',
  styleUrls: ['./single-landing-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SingleLandingPageComponent extends LangSinglePageComponent
  implements OnInit {

  @ViewChildren(ImageUploadComponent)
  imageUploadComponent: QueryList<ImageUploadComponent>;

  collection = FirestoreCollections.landingPage;
  categories$: Observable<Category[]>;
  products$: Observable<Product[]>;

  ngOnInit() {
    super.ngOnInit();

    this.categories$ = this.state.language$.pipe(
      switchMap(lang =>
        this.afs.collection(`${FirestoreCollections.Categories}-${lang}`).get()
      ),
      map(snapshots =>
        snapshots.docs.map(action => ({
          id: action.id,
          ...(action.data() as Category)
        }))
      )
    );

    this.products$ = this.state.language$.pipe(
      switchMap(lang =>
        this.afs.collection(`${FirestoreCollections.Products}-${lang}`).get()
      ),
      map(snapshots =>
        snapshots.docs.map(action => ({
          id: action.id,
          ...(action.data() as Product)
        }))
      ),
      shareReplay(1)
    )
  }

  buildForm(data: any) {
    this.form = this.fb.group({
      id: data.id || '',
      title: data.title || '',
      featuredImage: data.featuredImage || '',
      featuredImageDesktop: data.featuredImageDesktop || '',
      products: data.products ? [data.products.map(product => product.id)] : [[]],
      category: data.category || '',
      active: data.active || false
    });
  }

  getSaveData(...args) {
    return forkJoin([
      this.products$
        .pipe(
          take(1)
        ),
      ...this.imageUploadComponent.map(item => item.save())
    ]).pipe(
      switchMap(([products]) => {
        const {id, ...data} = this.form.getRawValue();

        data.products = data.products.map(product => {
          const selected = products.find(prod => prod.id === product);

          return {
            id: selected.id,
            image: selected.gallery && selected.gallery.length ? selected.gallery[0] : ''
          }
        });

        args[0] = id;
        args[1] = data;

        return super.getSaveData(...args);
      })
    );
  }
}
