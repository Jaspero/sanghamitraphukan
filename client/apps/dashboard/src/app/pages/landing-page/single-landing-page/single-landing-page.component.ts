import {ChangeDetectionStrategy, Component} from '@angular/core';
import {FirestoreCollections} from '@jf/enums/firestore-collections.enum';
import {LangSinglePageComponent} from '../../../shared/components/lang-single-page/lang-single-page.component';

@Component({
  selector: 'jfsc-single-landing-page',
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
