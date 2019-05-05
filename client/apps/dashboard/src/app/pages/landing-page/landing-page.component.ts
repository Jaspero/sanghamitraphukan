import {ChangeDetectionStrategy, Component} from '@angular/core';
import {LangListComponent} from '../../shared/components/lang-list/lang-list.component';
import {FirestoreCollections} from '@jf/enums/firestore-collections.enum';
import {LandingPage} from '@jf/interfaces/landing-page.interface';

@Component({
  selector: 'jfsc-landing-page',
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LandingPageComponent extends LangListComponent<LandingPage> {
  collection = FirestoreCollections.landingPage;
  displayedColumns = [
    'checkBox',
    'id',
    'createdOn',
    'title',
    'category',
    'actions'
  ];
}
