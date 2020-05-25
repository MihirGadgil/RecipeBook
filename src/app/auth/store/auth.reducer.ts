import { Action, createReducer, on } from '@ngrx/store';
import { User } from '../user.model';
import * as AuthActions from './auth.actions';

export interface State { user: User; authError: string; loading: boolean }
const initialState: State = { user: null, authError: null, loading: false };

export function AuthReducer(authState: State | undefined, authAction: Action) {
  return createReducer(
    initialState,
    on(AuthActions.loginStart, AuthActions.signupStart, state => ({...state, authError: null, loading: true})),
    on(AuthActions.authenticationSuccess, (state, action) =>
      ({ ...state, authError: null, loading: false, user: new User(action.email, action.userId, action.token, action.expirationDate )})),
    on(AuthActions.authenticationFailure, (state, action) => ({  ...state, user: null, authError: action.errorMessage, loading: false})),
    on(AuthActions.logout, state => ({...state, user: null })),
    on(AuthActions.clearError, state => ({...state, authError: null })),
  )(authState, authAction);
}