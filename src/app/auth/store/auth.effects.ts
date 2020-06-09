import { Actions, createEffect, ofType } from '@ngrx/effects';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import * as AuthActions from './auth.actions';
import { switchMap, catchError, map, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { of, Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { Action } from '@ngrx/store';
import { User } from '../user.model';
import { AuthService } from '../auth.service';

export interface AuthResponseData {
  kind: string;
  idToken: string;
  email: string;
  refreshToken: string;
  expiresIn: string;
  localId: string;
  registered?: boolean;
}

const handleAuthentication = (resData: AuthResponseData): Action => {
  const expirationDate = new Date(new Date().getTime()+ (+resData.expiresIn *1000));
  const user = new User(resData.email, resData.localId, resData.idToken, expirationDate);
  localStorage.setItem('user', JSON.stringify(user));

  return AuthActions.authenticationSuccess({
    email: resData.email,
    userId: resData.localId,
    token: resData.idToken,
    expirationDate,
    redirect: true
  });
}

const handleError = (errorResponse: HttpErrorResponse): Observable<Action> => {
  let errorMessage = 'An Unknown error occurred!';
  if (!errorResponse.error || !errorResponse.error.error) {
    return of(AuthActions.authenticationFailure({errorMessage}));
  }
  switch (errorResponse.error.error.message) {
    case 'EMAIL_EXISTS' :
      errorMessage = 'The email address is already in use by another account.';
      break;
    case 'OPERATION_NOT_ALLOWED':
      errorMessage = 'Password sign-in is disabled for this project.';
      break;
    case 'TOO_MANY_ATTEMPTS_TRY_LATER' :
      errorMessage = 'We have blocked all requests from this device due to ' +
        'unusual activity. Try again later.';
      break;
    case 'EMAIL_NOT_FOUND' :
      errorMessage = 'There is no user record corresponding to this identifier.' +
        ' The user may have been deleted.';
      break;
    case 'INVALID_PASSWORD':
      errorMessage = 'The password is invalid or the user does not have a password.';
      break;
    case 'USER_DISABLED' :
      errorMessage = 'The user account has been disabled by an administrator.';
      break;
  }
  return of(AuthActions.authenticationFailure({errorMessage}));
}

@Injectable()
export class AuthEffects {
  static readonly API_KEY = environment.FirebaseAPIkey;

  constructor(private actions$: Actions, private http: HttpClient, private router: Router, private authService: AuthService) {}

  authLogin$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.loginStart),
      switchMap(action => {
        return this.http
        .post<AuthResponseData>(
          'https://www.googleapis.com/identitytoolkit/v3/relyingparty/verifyPassword?key=' + AuthEffects.API_KEY,
          {
            email: action.email,
            password: action.password,
            returnSecureToken: true
          }
        ).pipe(
          tap(
            this.setLogoutTimer.bind(this)
          ),
          map(handleAuthentication),
          catchError(handleError)
        )
      })
    )
  );

  authSignup$ = createEffect(() =>
      this.actions$.pipe(
        ofType(AuthActions.signupStart),
        switchMap(action => {
          return this.http
          .post<AuthResponseData>(
            'https://www.googleapis.com/identitytoolkit/v3/relyingparty/signupNewUser?key=' + AuthEffects.API_KEY,
            {
              email: action.email,
              password: action.password,
              returnSecureToken: true
            }
          ).pipe(
            tap(
              this.setLogoutTimer.bind(this)
            ),
            map(handleAuthentication),
            catchError(handleError)
          )
        })
      )
   );

  autoLogin$ = createEffect(() =>
  this.actions$.pipe(
        ofType(AuthActions.autoLogin),
        map(() => {
          const user = localStorage.getItem('user');
          if (!user) {
            return {type: 'DUMMY'}
          }
          const userData: {
            email: string,
            id: string,
            _token: string,
            _tokenExpirationDate: string
          } = JSON.parse(user);

          if (userData._token) {
            const expirationDuration =
              new Date(userData._tokenExpirationDate).getTime() - new Date().getTime();
            this.authService.setLogoutTimer(expirationDuration);

            return AuthActions.authenticationSuccess({
              email: userData.email,
              userId: userData.id,
              token: userData._token,
              expirationDate: new Date(userData._tokenExpirationDate),
              redirect: false
            });
          }
          return {type: 'DUMMY'}
        })
    )
  )

  authSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(AuthActions.authenticationSuccess),
    tap((actionData) => {
      if (actionData.redirect) {
        this.router.navigate(['/recipes']);
      }
    })
   ),
   { dispatch: false }
  );

  authLogout$ = createEffect(() =>
  this.actions$.pipe(
    ofType(AuthActions.logout),
    tap(() => {
      this.authService.clearLogoutTimer();
      localStorage.removeItem('user');
      this.router.navigate(['/auth']);
    })
  ),
  { dispatch: false }
  );

  private setLogoutTimer(response: AuthResponseData) {
    this.authService.setLogoutTimer(+response.expiresIn * 1000);
  }

}
