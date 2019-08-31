import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';
import {AngularFireAuth} from '@angular/fire/auth';
import {AngularFirestore} from '@angular/fire/firestore';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {MatDialog} from '@angular/material';
import {notify} from '@jf/utils/notify.operator';
import {from, throwError} from 'rxjs';
import {catchError, tap} from 'rxjs/operators';
import {LoginSignupDialogComponent} from '../../../../shared/components/login-signup-dialog/login-signup-dialog.component';
import {RepeatPasswordValidator} from '../../../../shared/helpers/compare-passwords';

@Component({
  selector: 'jfs-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChangePasswordComponent implements OnInit {
  constructor(
    private fb: FormBuilder,
    private afAuth: AngularFireAuth,
    private afs: AngularFirestore,
    private dialog: MatDialog
  ) {}

  passwordForm: FormGroup;

  ngOnInit() {
    this.buildForm();
  }

  buildForm() {
    this.passwordForm = this.fb.group(
      {
        password: ['', [Validators.required, Validators.minLength(6)]],
        repeatPassword: ['', [Validators.required, Validators.minLength(6)]]
      },
      {validator: RepeatPasswordValidator('Passwords not matching')}
    )

  }

  changePassword() {
    return () => {
      const pass = this.passwordForm.getRawValue();

      return from(this.afAuth.auth.currentUser.updatePassword(pass.password))
        .pipe(
          notify({
            error: 'For security reasons please re-login to update your password.'
          }),

          // TODO: If the error for invalid password shows up open a dialog here
          catchError(err => {
            this.dialog.open(LoginSignupDialogComponent);
            return throwError(err);
          }),
          tap(() =>
            this.passwordForm.reset()
          )
        )
    };
  }
}
