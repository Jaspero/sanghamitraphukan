import {ChangeDetectionStrategy, Component, ViewChild} from '@angular/core';
import {Validators} from '@angular/forms';
import {FirestoreCollections} from '@jf/enums/firestore-collections.enum';
import {switchMap} from 'rxjs/operators';
import {LangSinglePageComponent} from '../../../shared/components/lang-single-page/lang-single-page.component';
import {URL_REGEX} from '../../../shared/const/url-regex.const';
import {ImageUploadComponent} from '../../../shared/modules/file-upload/image-upload/image-upload.component';
import {LANDING_GENERATED_FEATURED} from '../../landing-page/consts/landing-page-generated-images.const';

@Component({
  selector: 'jfsc-categories-single-page',
  templateUrl: './collection-single-page.component.html',
  styleUrls: ['./collection-single-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CollectionSinglePageComponent extends LangSinglePageComponent {
  collection = FirestoreCollections.Collections;

  @ViewChild(ImageUploadComponent, {static: false})
  imageUploadComponent: ImageUploadComponent;

  buildForm(data: any) {
    this.form = this.fb.group({
      id: [
        {value: data.id, disabled: this.currentState === this.viewState.Edit},
        [Validators.required, Validators.pattern(URL_REGEX)]
      ],
      image: data.image || '',
      featured: data.featured || false,
      name: [data.name || '', Validators.required],
      order: data.order || 0
    });
  }

  getSaveData(...args) {
    let [id, item, lang] = args;

    if (!id) {
      id = this.createId();
    }

    return this.imageUploadComponent.save(
      `${FirestoreCollections.Collections}-${lang}`,
      id,
      LANDING_GENERATED_FEATURED
    ).pipe(
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
