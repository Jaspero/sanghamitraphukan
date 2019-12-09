import {ChangeDetectionStrategy, Component, ViewChild} from '@angular/core';
import {Validators} from '@angular/forms';
import {FirestoreCollections} from '@jf/enums/firestore-collections.enum';
import {switchMap} from 'rxjs/operators';
import {LangSinglePageComponent} from '../../../../shared/components/lang-single-page/lang-single-page.component';
import {URL_REGEX} from '../../../../shared/const/url-regex.const';
import {GalleryUploadComponent} from '../../../../shared/modules/file-upload/gallery-upload/gallery-upload.component';
import {convertToSlug} from '../../../../shared/utils/string-to-slug';
import {NEWS_GENERATED_IMAGES} from '../consts/news-generated-images.const';

@Component({
  selector: 'jfsc-news-single-page',
  templateUrl: './news-single-page.component.html',
  styleUrls: ['./news-single-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NewsSinglePageComponent extends LangSinglePageComponent {
  @ViewChild(GalleryUploadComponent, {static: false})
  galleryUploadComponent: GalleryUploadComponent;

  collection = FirestoreCollections.News;

  buildForm(data: any) {
    this.form = this.fb.group({
      id: [
        {value: data.id, disabled: this.currentState === this.viewState.Edit},
        [Validators.pattern(URL_REGEX)]
      ],
      title: [data.title || '', Validators.required],
      gallery: [data.gallery || []],
      shortDescription: [data.shortDescription || '', Validators.required],
      content: [data.content || '', Validators.required]
    });
  }

  createId(): string {
    return this.form
      .get('title')
      .value.toLowerCase()
      .replace(/[^\w ]+/g, '')
      .replace(/ +/g, '-');
  }

  getSaveData(...args) {
    let [id, item, lang] = args;

    if (!id) {
      id = this.createId();
    }

    return this.galleryUploadComponent.save(
      `${FirestoreCollections.News}-${lang}`,
      id,
      NEWS_GENERATED_IMAGES
    ).pipe(
      switchMap(() => {
        if (!args[0]) {
          args[0] = convertToSlug(args[1].title);
        }

        args[1].gallery = this.form.get('gallery').value;

        return super.getSaveData(...args);
      })
    );
  }
}
