import {Component, OnInit, ChangeDetectionStrategy, ViewChild, TemplateRef} from '@angular/core';
import {AngularFirestore} from '@angular/fire/firestore';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {MatDialog} from '@angular/material/dialog';
import {notify} from '@jf/utils/notify.operator';
import {from} from 'rxjs';
import {tap} from 'rxjs/operators';

@Component({
  selector: 'jfs-silk-road',
  templateUrl: './silk-road.component.html',
  styleUrls: ['./silk-road.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SilkRoadComponent implements OnInit {
  constructor(
    private fb: FormBuilder,
    private afs: AngularFirestore,
    private dialog: MatDialog
  ) {}

  @ViewChild('newsletter', {static: true})
  newsletterTemplate: TemplateRef<any>;

  form: FormGroup;

  ngOnInit() {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    })
  }

  openDialog() {
    this.dialog.open(
      this.newsletterTemplate,
      {
        width: '400px'
      }
    )
  }

  save() {
    return () =>
      from(this.afs.doc(`newsletter/${this.form.get('email').value}`).set({}))
        .pipe(
          tap(() => {
            this.dialog.closeAll();
          }),
          notify({
            success: `Success! Please check your email.`,
            error: `Unfortunately there was an error with your signup.`
          })
        )
  }
}
