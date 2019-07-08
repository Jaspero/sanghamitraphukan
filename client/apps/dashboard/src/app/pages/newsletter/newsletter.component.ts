import {
  ChangeDetectionStrategy,
  Component,
  TemplateRef,
  ViewChild
} from '@angular/core';
import {FormControl, Validators} from '@angular/forms';
import {FirestoreCollections} from '@jf/enums/firestore-collections.enum';
import {Newsletter} from '@jf/interfaces/newsletter.interface';
import {notify} from '@jf/utils/notify.operator';
import {from} from 'rxjs';
import {filter, switchMap} from 'rxjs/operators';
import {ListComponent} from '../../shared/components/list/list.component';

@Component({
  selector: 'jfsc-newsletter',
  templateUrl: './newsletter.component.html',
  styleUrls: ['./newsletter.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NewsletterComponent extends ListComponent<Newsletter> {
  collection = FirestoreCollections.Newsletter;
  displayedColumns = ['checkBox', 'id', 'actions'];
  additionalRouteData = {
    filters: {
      search: ''
    },
    sort: null
  };

  @ViewChild('addDialog', {static: true})
  addDialog: TemplateRef<any>;
  emailControl: FormControl;

  addEmail(items: Newsletter[]) {
    this.emailControl = new FormControl('', Validators.required);

    this.dialog
      .open(this.addDialog)
      .afterClosed()
      .pipe(
        filter(res => res),
        switchMap(() =>
          from(
            this.afs
              .collection(this.collection)
              .doc(this.emailControl.value)
              .set({})
          )
        ),
        notify()
      )
      .subscribe();
  }
}
