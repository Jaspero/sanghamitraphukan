import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  QueryList,
  ViewChild,
  ViewChildren
} from '@angular/core';
import {FirestoreCollections} from '@jf/enums/firestore-collections.enum';
import {Collection} from '@jf/interfaces/collection.interface';
import {forkJoin, Observable} from 'rxjs';
import {map, switchMap} from 'rxjs/operators';
import {LangSinglePageComponent} from '../../../shared/components/lang-single-page/lang-single-page.component';
import {GalleryUploadComponent} from '../../../shared/modules/file-upload/gallery-upload/gallery-upload.component';
import {ImageUploadComponent} from '../../../shared/modules/file-upload/image-upload/image-upload.component';
import {
  LANDING_GENERATED_FEATURED,
  LANDING_GENERATED_IMAGES
} from '../consts/landing-page-generated-images.const';

@Component({
  selector: 'jfsc-single-landing-page',
  templateUrl: './single-landing-page.component.html',
  styleUrls: ['./single-landing-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SingleLandingPageComponent extends LangSinglePageComponent
  implements OnInit {
  @ViewChild(GalleryUploadComponent, {static: false})
  galleryUploadComponent: GalleryUploadComponent;

  @ViewChildren(ImageUploadComponent)
  imageUploadComponent: QueryList<ImageUploadComponent>;

  collection = FirestoreCollections.LandingPage;
  collections$: Observable<Collection[]>;

  ngOnInit() {
    super.ngOnInit();

    this.collections$ = this.state.language$.pipe(
      switchMap(lang =>
        this.afs.collection(`${FirestoreCollections.Collections}-${lang}`).get()
      ),
      map(snapshots =>
        snapshots.docs.map(action => ({
          id: action.id,
          ...(action.data() as Collection)
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
      objectYPosition: data.objectYPosition || 50,
      objectYPositionDesktop: data.objectYPositionDesktop || 50,
      gallery: data.gallery ? [data.gallery] : [[]],
      collection: data.collection || '',
      active: data.active || false
    });
  }

  getSaveData(...args) {
    let [id, item, lang] = args;

    if (!id) {
      id = this.createId();
    }

    return forkJoin([
      this.galleryUploadComponent.save(
        `${FirestoreCollections.LandingPage}-${lang}`,
        id,
        LANDING_GENERATED_IMAGES
      ),
      ...this.imageUploadComponent.map(item =>
        item.save(
          `${FirestoreCollections.LandingPage}-${lang}`,
          id,
          LANDING_GENERATED_FEATURED
        )
      )
    ]).pipe(
      switchMap(() => {
        const {id, ...data} = this.form.getRawValue();

        data.order = 0;

        args[0] = id;
        args[1] = data;

        return super.getSaveData(...args);
      })
    );
  }
}
