import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnInit,
  ViewChild
} from '@angular/core';
import {AngularFireAuth} from '@angular/fire/compat/auth';
import {UntypedFormBuilder, UntypedFormGroup, Validators} from '@angular/forms';
import {Router} from '@angular/router';
import {notify} from '@jf/utils/notify.operator';
import firebase from 'firebase/compat';
import {from, throwError} from 'rxjs';
import {catchError, filter, switchMap} from 'rxjs/operators';
import {environment} from '../../../../../shop/src/environments/environment';
import {StateService} from '../../shared/services/state/state.service';
import {MatSnackBar} from '@angular/material/snack-bar';
import auth = firebase.auth;

@Component({
  selector: 'jfsc-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginComponent implements OnInit {
  constructor(
    public router: Router,
    public afAuth: AngularFireAuth,
    public fb: UntypedFormBuilder,
    private snackBar: MatSnackBar,
    private state: StateService
  ) {}

  @ViewChild('password', {static: true}) passwordField: ElementRef;

  loginForm: UntypedFormGroup;

  ngOnInit() {
    this.afAuth.user
      .pipe(
        filter(user => !!user),
        switchMap(user => user.getIdTokenResult())
      )
      .subscribe(res => {
        /**
         * If the user has any kind of role we allow
         * access to the dashboard
         */
        if (res.claims.role) {
          this.state.role = res.claims.role;
          this.router.navigate(['/dashboard']);
        } else {
          this.afAuth.signOut().then();
          this.snackBar.open(
            'Access to platform denied. Please contact an administrator.',
            'Dismiss',
            {duration: 2000}
          );
        }
      });

    this.buildForm();
  }

  loginGoogle() {
    this.afAuth.signInWithPopup(new auth.GoogleAuthProvider()).then();
  }

  loginFacebook() {
    this.afAuth.signInWithPopup(new auth.FacebookAuthProvider()).then();
  }

  loginTwitter() {
    this.afAuth.signInWithPopup(new auth.TwitterAuthProvider()).then();
  }

  logInWithInstagram() {
    window.open(
      `${environment.restApi}/instagram/redirect`,
      'firebaseAuth',
      'height=315,width=400'
    );
  }

  loginEmail() {
    return () => {
      const data = this.loginForm.getRawValue();

      return from(
        this.afAuth.signInWithEmailAndPassword(
          data.emailLogin,
          data.passwordLogin
        )
      ).pipe(
        notify({
          success: 'You are now logged in',
          error:
            'The email and password you entered did not match our records. Please double-check and try again.'
        }),
        catchError(error => {
          this.loginForm.get('passwordLogin').reset();
          this.passwordField.nativeElement.focus();
          return throwError(error);
        })
      );
    };
  }

  private buildForm() {
    this.loginForm = this.fb.group({
      emailLogin: ['', [Validators.required, Validators.email]],
      passwordLogin: ['', Validators.required]
    });
  }
}
