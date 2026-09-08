import {
  HttpErrorResponse,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest,
} from '@angular/common/http';
import { AuthService } from '../../services/auth-service';
import { BehaviorSubject, catchError, filter, switchMap, take, throwError } from 'rxjs';
import { inject } from '@angular/core';
import { ApiResponse } from '../../../models/apiResponse';
import { tokenModel } from '../../../models/tokenMode';

let isRefreshing = false;
const refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

export const tokenInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  let currentUser = authService.currentUserValue;

  if (req.url.includes('/Auth/RefreshToken')) {
    return next(req);
  }

  let authReq = req;
  if (currentUser?.accessToken) {
    authReq = addToken(req, currentUser.accessToken);
  }

  return next(authReq).pipe(
    catchError((error) => {
      if (error instanceof HttpErrorResponse && error.status === 401) {
        return handle401Error(authReq, next, authService);
      }
      return throwError(() => error);
    }),
  );
};

function addToken(req: HttpRequest<any>, token: string) {
  return req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`,
    },
  });
}

function handle401Error(req: HttpRequest<any>, next: HttpHandlerFn, authService: AuthService) {
  if (!isRefreshing) {
    isRefreshing = true;
    refreshTokenSubject.next(null);

    return authService.RefreshToken().pipe(
      switchMap((response: ApiResponse<tokenModel>) => {
        const newAccessToken = response.data?.accessToken;

        if (!newAccessToken) {
          throw new Error('Refresh token does not have returned');
        }

        isRefreshing = false;

        refreshTokenSubject.next(newAccessToken);

        return next(addToken(req, newAccessToken));
      }),

      catchError((err) => {
        isRefreshing = false;
        authService.Logout();
        return throwError(() => err);
      }),
    );
  }

  return refreshTokenSubject.pipe(
    filter((token): token is string => token !== null),
    take(1),
    switchMap((accessToken) => {
      return next(addToken(req, accessToken));
    }),
  );
}
