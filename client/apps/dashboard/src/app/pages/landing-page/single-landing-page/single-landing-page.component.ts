import {ChangeDetectionStrategy, Component} from '@angular/core';
import {LangSinglePageComponent} from '../../../shared/components/lang-single-page/lang-single-page.component';
import {FirestoreCollections} from '@jf/enums/firestore-collections.enum';

@Component({
  selector: 'jfs-single-landing-page',
  templateUrl: './single-landing-page.component.html',
  styleUrls: ['./single-landing-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SingleLandingPageComponent extends LangSinglePageComponent {
  collection = FirestoreCollections.landingPage;
  buildForm(data: any) {
    this.form = this.fb.group({
      title: data.title || '',
      featuredImage: data.featuredImage || '',
      gallery: data.gallery || []
    });
  }
}
