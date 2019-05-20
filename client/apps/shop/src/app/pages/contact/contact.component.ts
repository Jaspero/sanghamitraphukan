import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';
import {AngularFirestore} from '@angular/fire/firestore';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {FirestoreCollections} from '@jf/enums/firestore-collections.enum';
import {notify} from '@jf/utils/notify.operator';
import * as nanoid from 'nanoid';
import {from} from 'rxjs';

@Component({
  selector: 'jfs-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ContactComponent implements OnInit {
  constructor(private fb: FormBuilder, private afs: AngularFirestore) {}

  form: FormGroup;

  ngOnInit() {
    this.buildForm();
  }

  buildForm() {
    this.form = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      message: ['', Validators.required]
    });
  }

  send() {
    const formData = this.form.getRawValue();

    from(
      this.afs
        .collection(FirestoreCollections.Contacts)
        .doc(nanoid())
        .set(formData)
    )
      .pipe(notify())
      .subscribe(() => {
        this.form.reset();
      });
  }
}
