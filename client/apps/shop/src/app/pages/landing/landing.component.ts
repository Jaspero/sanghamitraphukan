import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
  OnInit,
  TemplateRef,
  ViewChild
} from '@angular/core';
import {AngularFirestore} from '@angular/fire/firestore';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {MatDialog} from '@angular/material/dialog';
import {Router} from '@angular/router';
import {SliderOptions} from '@jaspero/ng-slider';
import {BROWSER_CONFIG} from '@jf/consts/browser-config.const';
import {STATIC_CONFIG} from '@jf/consts/static-config.const';
import {FirebaseOperator} from '@jf/enums/firebase-operator.enum';
import {FirestoreCollections} from '@jf/enums/firestore-collections.enum';
import {notify} from '@jf/utils/notify.operator';
import {from, Observable} from 'rxjs';
import {map, take, tap} from 'rxjs/operators';
import {LightboxComponent} from '../../shared/components/lightbox/lightbox.component';
import {Landing} from '../../shared/interfaces/landing.interface';
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

  product$: Observable<Landing[]>;
  sliderOption: Partial<SliderOptions> = {
    blocksPerView: 5,
    loop: false
  };
  form: FormGroup;

  @ViewChild('popup', {static: true})
  popup: TemplateRef<any>;

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.resize(event.target.innerWidth);
  }

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

    this.resize(BROWSER_CONFIG.screenWidth);
    this.product$ = this.afs
      .collection<Landing>(
        `${FirestoreCollections.LandingPage}-${STATIC_CONFIG.lang}`,
        ref =>
          ref
            .where('active', FirebaseOperator.Equal, true)
            .orderBy('order', 'asc')
      )
      .valueChanges()
      .pipe(
        map(actions =>
          actions.map(action => {
            if (!BROWSER_CONFIG.isMobileDevice) {
              action.featuredImage = action.featuredImageDesktop;
              action.objectYPosition = action.objectYPositionDesktop;
            }

            action.gallery = action.gallery || [];

            return action;
          })
        )
      );
  }

  goToSingle(category: string) {
    this.router.navigate(['/shop'], {
      queryParams: {
        category
      }
    });
  }

  openLightBox(landing: Landing, initialSlide: number) {
    this.dialog.open(LightboxComponent, {
      data: {images: landing.gallery, initialSlide},
      panelClass: 'mat-dialog-of-visible'
    });
  }

  resize(size) {
    let num = this.sliderOption.blocksPerView;
    switch (true) {
      case size < 900:
        num = 2;
        break;
      case size < 1200:
        num = 3;
        break;
      case size < 1800:
        num = 4;
        break;
      case size >= 1800:
        num = 5;
        break;
    }
    this.sliderOption = {
      blocksPerView: num,
      loop: false
    };
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
