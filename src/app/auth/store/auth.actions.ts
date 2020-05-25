import { createAction, props } from '@ngrx/store';

export const loginStart = createAction('[Auth] Login Start', props<{ email: string; password: string}>());
export const signupStart = createAction('[Auth] Signup Start', props<{ email: string; password: string}>());
export const authenticationSuccess = createAction('[Auth] Authentication Success',
  props<{email: string; userId: string; token: string; expirationDate: Date; redirect: boolean }>()
);
export const authenticationFailure = createAction('[Auth] Authentication Failure', props<{errorMessage: string}>());
export const clearError = createAction('[Auth] Clear Error');
export const autoLogin = createAction('[Auth] Autologin');
export const logout = createAction('[Auth] Autologout');
