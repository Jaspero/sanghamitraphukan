import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  TemplateRef,
  ViewChild
} from '@angular/core';
import {AngularFireAuth} from '@angular/fire/compat/auth';
import {AngularFirestore} from '@angular/fire/compat/firestore';
import {UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators} from '@angular/forms';
import {MatDialog} from '@angular/material/dialog';
import {DYNAMIC_CONFIG} from '@jf/consts/dynamic-config.const';
import {FirebaseOperator} from '@jf/enums/firebase-operator.enum';
import {FirestoreCollections} from '@jf/enums/firestore-collections.enum';
import {GiftCard} from '@jf/interfaces/gift-card.interface';
import {notify} from '@jf/utils/notify.operator';
import nanoid from 'nanoid';
import {from, Observable} from 'rxjs';
import {filter, map, switchMap} from 'rxjs/operators';
import {AngularFireFunctions} from '@angular/fire/functions';

@Component({
  selector: 'jfs-gift-cards',
  templateUrl: './gift-cards.component.html',
  styleUrls: ['./gift-cards.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GiftCardsComponent implements OnInit {
  constructor(
    private afs: AngularFirestore,
    public aff: AngularFireFunctions,
    private dialog: MatDialog,
    private fb: UntypedFormBuilder,
    private afAuth: AngularFireAuth
  ) {}

  @ViewChild('giftTemplate')
  giftTemplate: TemplateRef<any>;

  @ViewChild('applyTemplate')
  applyTemplate: TemplateRef<any>;

  giftCards$: Observable<any>;
  giftCardsInstances$: Observable<any>;
  form: UntypedFormGroup;
  code: UntypedFormControl;

  dynamicConfig = DYNAMIC_CONFIG;

  ngOnInit() {
    this.giftCards$ = this.afs
      .collection<any>(FirestoreCollections.GiftCards)
      .snapshotChanges()
      .pipe(
        map(actions =>
          actions.map(action => ({
            id: action.payload.doc.id,
            ...(action.payload.doc.data() as GiftCard)
          }))
        )
      );

    this.giftCardsInstances$ = this.afs
      .collection<any>(FirestoreCollections.GiftCardsInstances, ref =>
        ref.where(
          'customerId',
          FirebaseOperator.Equal,
          this.afAuth.auth.currentUser.uid
        )
      )
      .snapshotChanges()
      .pipe(
        map(actions =>
          actions.map(action => ({
            id: action.payload.doc.id,
            ...action.payload.doc.data()
          }))
        )
      );
  }

  buildForm() {
    this.form = this.fb.group({
      parentGiftCard: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      creditCard: ['', Validators.required]
    });

    this.code = new UntypedFormControl('');
  }

  dialogBuyOpen() {
    this.dialog.open(this.giftTemplate);
    this.buildForm();
  }

  dialogApplyOpen() {
    this.dialog.open(this.applyTemplate);
    this.buildForm();
  }

  buy() {
    return () => {
      const formData = this.form.getRawValue();
      formData.code = this.randomGiftCardId();
      formData.values = {};
      formData.currency = DYNAMIC_CONFIG.currency.primary;
      const customerId = this.afAuth.auth.currentUser.uid;

      return from(
        this.afs
          .collection(FirestoreCollections.GiftCardsInstances)
          .doc(nanoid())
          .set({
            ...formData,
            customerId
          })
      ).pipe(
        notify({
          success: 'Gift Card successfully bought',
          error: 'Could not buy Gift Card'
        })
      );
    };
  }

  randomGiftCardId(characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', length = 20) {
    let result = '';
    for (let i = 0; i < length; i++) {
      result += characters[Math.floor(Math.random() * characters.length)];
      result += (i + 1) % 4 === 0 && i + 1 !== length ? '-' : '';
    }

    return result;
  }

  apply() {
    const code = this.code.value;
    const customerId = this.afAuth.auth.currentUser.uid;
    this.afs
      .collection(FirestoreCollections.GiftCardsInstances)
      .doc(code)
      .get()
      .pipe(
        filter(value => value.exists),
        switchMap(() =>
          from(
            this.afs
              .collection(FirestoreCollections.GiftCardsInstances)
              .doc(code)
              .set(
                {
                  usedBy: customerId
                },
                {
                  merge: true
                }
              )
          )
        ),
        notify()
      )
      .subscribe();
  }
}
