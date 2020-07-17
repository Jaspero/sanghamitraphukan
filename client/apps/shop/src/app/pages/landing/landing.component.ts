import {ChangeDetectionStrategy, Component, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {AngularFirestore} from '@angular/fire/firestore';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {MatDialog} from '@angular/material/dialog';
import {Router} from '@angular/router';
import {STATIC_CONFIG} from '@jf/consts/static-config.const';
import {FirestoreCollections} from '@jf/enums/firestore-collections.enum';
import {Collection} from '@jf/interfaces/collection.interface';
import {notify} from '@jf/utils/notify.operator';
import {from, Observable} from 'rxjs';
import {take, tap} from 'rxjs/operators';
import {StateService} from '../../shared/services/state/state.service';

@Component({
  selector: 'jfs-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LandingComponent implements OnInit {
  constructor(
    private afs: AngularFirestore,
    private router: Router,
    private dialog: MatDialog,
    private state: StateService,
    private fb: FormBuilder
  ) {}

  collections$: Observable<Collection[]>;
  form: FormGroup;

  @ViewChild('popup', {static: true})
  popup: TemplateRef<any>;

  ngOnInit() {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });

    if (!this.state.landingDialogShown) {
      const showDialogOn = Date.now() - 7 * 24 * 60 * 60 * 1000;
      let welcomeDialogDate: any = localStorage.getItem('landing-dialog');

      if (welcomeDialogDate) {
        welcomeDialogDate = parseInt(welcomeDialogDate);
      }

      if (!welcomeDialogDate || welcomeDialogDate <= showDialogOn) {
        setTimeout(() => {
          this.state.landingDialogShown = true;
          localStorage.setItem('landing-dialog', Date.now().toString());
          this.dialog.open(this.popup, {width: '500px', autoFocus: false});
        }, 3000);
      }
    }

    this.collections$ = this.afs
      .collection<Collection>(
        `${FirestoreCollections.Collections}-${STATIC_CONFIG.lang}`,
        ref =>
          ref
            .orderBy('order', 'asc')
      )
      .valueChanges({idField: 'id'})
      .pipe();
  }

  goToSingle(collection: string) {
    this.router.navigate(['/shop'], {
      queryParams: {
        collection
      }
    });
  }

  subscribe() {
    return () => {
      const email = this.form.get('email').value;

      return from(
        this.afs.doc(`newsletter/${email}`).set({
          discount: true
        })
      ).pipe(
        take(1),
        notify({
          success: 'An email has been sent to your inbox.'
        }),
        tap(() => {
          this.dialog.closeAll();
          this.router.navigate(['/news/letitrain']);
        })
      );
    };
  }
}
