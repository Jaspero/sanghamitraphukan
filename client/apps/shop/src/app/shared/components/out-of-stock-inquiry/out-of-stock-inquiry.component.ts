import {Component, Inject, OnInit} from '@angular/core';
import {AngularFirestore} from '@angular/fire/compat/firestore';
import {UntypedFormBuilder, UntypedFormGroup, Validators} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {FirestoreCollections} from '@jf/enums/firestore-collections.enum';
import {Product} from '@jf/interfaces/product.interface';
import {notify} from '@jf/utils/notify.operator';
import {from} from 'rxjs';
import {tap} from 'rxjs/operators';
import {nanoid} from 'nanoid';

@Component({
  selector: 'jfs-out-of-stock-inquiry',
  templateUrl: './out-of-stock-inquiry.component.html',
  styleUrls: ['./out-of-stock-inquiry.component.css']
})
export class OutOfStockInquiryComponent implements OnInit {
  constructor(
    @Inject(MAT_DIALOG_DATA)
    public product: Product,
    private dialogRef: MatDialogRef<OutOfStockInquiryComponent>,
    private fb: UntypedFormBuilder,
    private afs: AngularFirestore
  ) {}

  form: UntypedFormGroup;

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
    return () => {
      return from(
        this.afs
          .collection(FirestoreCollections.Contacts)
          .doc(nanoid())
          .set({
            ...this.form.getRawValue(),
            createdOn: Date.now(),
            product: {
              id: this.product.id,
              name: this.product.name
            }
          })
      ).pipe(
        notify(),
        tap(() => this.dialogRef.close())
      );
    };
  }
}
