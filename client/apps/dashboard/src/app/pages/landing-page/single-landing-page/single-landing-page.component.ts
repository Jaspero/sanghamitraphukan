import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  QueryList,
  ViewChild,
  ViewChildren
} from '@angular/core';
import {FirestoreCollections} from '@jf/enums/firestore-collections.enum';
import {Category} from '@jf/interfaces/category.interface';
import {forkJoin, Observable} from 'rxjs';
import {map, switchMap, tap} from 'rxjs/operators';
import {LangSinglePageComponent} from '../../../shared/components/lang-single-page/lang-single-page.component';
import {GalleryUploadComponent} from '../../../shared/modules/file-upload/gallery-upload/gallery-upload.component';
import {ImageUploadComponent} from '../../../shared/modules/file-upload/image-upload/image-upload.component';

@Component({
  selector: 'jfsc-single-landing-page',
  templateUrl: './single-landing-page.component.html',
  styleUrls: ['./single-landing-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SingleLandingPageComponent extends LangSinglePageComponent
  implements OnInit {
  @ViewChildren(GalleryUploadComponent)
  galleryUploadComponent: QueryList<GalleryUploadComponent>;

  @ViewChildren(ImageUploadComponent)
  imageUploadComponent: QueryList<ImageUploadComponent>;

  collection = FirestoreCollections.landingPage;
  categories$: Observable<Category[]>;

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
  }

  buildForm(data: any) {
    this.form = this.fb.group({
      id: data.id || '',
      title: data.title || '',
      featuredImage: data.featuredImage || '',
      featuredImageDesktop: data.featuredImageDesktop || '',
      gallery: data.gallery ? [data.gallery] : [[]],
      galleryDesktop: data.galleryDesktop ? [data.galleryDesktop] : [[]],
      category: data.category || ''
    });
  }

  getSaveData(...args) {
    return forkJoin([
      ...this.galleryUploadComponent.map(item => item.save()),
      ...this.imageUploadComponent.map(item => item.save())
    ]).pipe(
      switchMap(() => {
        const {id, ...data} = this.form.getRawValue();

        args[0] = id;
        args[1] = data;

        return super.getSaveData(...args);
      })
    );
  }
}
