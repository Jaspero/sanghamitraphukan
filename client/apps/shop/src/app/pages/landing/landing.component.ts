import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
  OnInit,
  TemplateRef,
  ViewChild
} from '@angular/core';
import {AngularFirestore} from '@angular/fire/firestore';
import {Router} from '@angular/router';
import {SliderOptions} from '@jaspero/ng-slider';
import {BROWSER_CONFIG} from '@jf/consts/browser-config.const';
import {STATIC_CONFIG} from '@jf/consts/static-config.const';
import {FirestoreCollections} from '@jf/enums/firestore-collections.enum';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {Landing} from '../../shared/interfaces/landing.interface';
import {MatDialog} from '@angular/material';

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
    private dialog: MatDialog
  ) {}

  product$: Observable<Landing[]>;
  sliderOption: Partial<SliderOptions> = {
    blocksPerView: 5,
    loop: false
  };

  @ViewChild('shopDisable') shopDisable: TemplateRef<any>;

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.resize(event.target.innerWidth);
  }

  ngOnInit() {
    this.resize(BROWSER_CONFIG.screenWidth);
    this.product$ = this.afs
      .collection<Landing>(
        `${FirestoreCollections.landingPage}-${STATIC_CONFIG.lang}`
      )
      .valueChanges()
      .pipe(
        map(actions =>
          actions.map(action => {
            if (!BROWSER_CONFIG.isMobileDevice) {
              action.featuredImage = action.featuredImageDesktop;
              action.gallery = action.galleryDesktop;
            }

            return action;
          })
        )
      );
  }

  disableShopForNow() {
    this.dialog.open(this.shopDisable, {
      width: '400px'
    });
  }

  goToSingle(category: string) {
    this.router.navigate(['/shop'], {
      queryParams: {
        category
      }
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
}
