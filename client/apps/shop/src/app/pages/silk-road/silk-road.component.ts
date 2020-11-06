import {Component, OnInit, ChangeDetectionStrategy} from '@angular/core';
import {AngularFirestore} from '@angular/fire/firestore';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
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
    private afs: AngularFirestore
  ) {}

  form: FormGroup;

  ngOnInit() {
    this.form = this.fb.group({
      name: ['', Validators.required],
      phone: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      height: ['', Validators.required],
      shoesSize: ['', Validators.required],
      dressSize: ['', Validators.required],
      experience: ['', Validators.required],
    })
  }

  save() {
    return () =>
      from(
        this.afs.collection('model-applications')
          .doc(this.afs.createId())
          .set({
            createdOn: Date.now(),
            ...this.form.getRawValue()
          })
      )
        .pipe(
          notify({
            success: 'Your application has been submitted successfully. Thank you!'
          }),
          tap(() => {
            this.form.reset();
          })
        )
  }
}
