import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  TemplateRef,
  ViewChild
} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {News} from '@jf/interfaces/news.interface';
import {from, Observable} from 'rxjs';
import {MatDialog} from '@angular/material/dialog';
import {FormBuilder, FormGroup} from '@angular/forms';
import {finalize, take, tap} from 'rxjs/operators';
import {notify} from '@jf/utils/notify.operator';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../../environments/environment';
import {AngularFireStorage} from '@angular/fire/storage';
import {AngularFirestore} from '@angular/fire/firestore';

@Component({
  selector: 'jfs-news-single',
  templateUrl: './news-single.component.html',
  styleUrls: ['./news-single.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NewsSingleComponent implements OnInit {
  constructor(
    private activatedRoute: ActivatedRoute,
    private dialog: MatDialog,
    private fb: FormBuilder,
    private http: HttpClient,
    private afs: AngularFirestore
  ) {}

  data$: Observable<{news: News}>;

  @ViewChild('popup', {static: true})
  popup: TemplateRef<any>;

  form: FormGroup;

  ngOnInit() {
    this.form = this.fb.group({
      email: ['']
    });

    this.data$ = this.activatedRoute.data as Observable<{news: News}>;

    this.data$.subscribe(data => {
      if (data.news.showPopup) {
        setTimeout(() => this.showPopup(), 1500);
      }
    });
  }

  showPopup() {
    this.dialog.open(this.popup, {width: '500px', autoFocus: false});
  }

  subscribe() {
    return () => {
      const email = this.form.get('email').value;

      this.afs.doc(`newsletter/${email}`).set({});

      return this.http
        .post(`${environment.restApi}/sendDiscount`, {email})
        .pipe(
          take(1),
          notify(),
          tap(() => {
            this.dialog.closeAll();
          })
        );
    };
  }
}
