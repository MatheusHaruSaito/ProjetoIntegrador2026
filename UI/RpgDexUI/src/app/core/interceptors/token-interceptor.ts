import { HttpErrorResponse, HttpHandlerFn, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
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

  if(currentUser && currentUser.accessToken) {
    req = addToken(req, currentUser.accessToken);
  }

  return next(req).pipe(
    catchError(error => {
      if(error instanceof HttpErrorResponse && error.status === 401){
        return handle401Error(req, next, authService);
      } else{
        return throwError(() => error);
      }
    })
  );

};

function addToken(req: HttpRequest<any>, token: string) {
  return req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`
    }
  });
}

function handle401Error(req: HttpRequest<any>, next: HttpHandlerFn, authService :AuthService) {
  if(!isRefreshing) {
    isRefreshing = true;
    refreshTokenSubject.next(null);

    return authService.RefreshToken().pipe(
      switchMap((response: ApiResponse<tokenModel>) => {
        isRefreshing = false;
        refreshTokenSubject.next(response.data!.accessToken);
        return next(addToken(req, response.data!.accessToken));
      }),
      catchError((err) => {
        isRefreshing = false;
        authService.Logout();
        return throwError(() => err);
      })
    );
  } else {
    return refreshTokenSubject.pipe(
      filter((token): token is string => !!token),
      take(1),
      switchMap((accesstoken) => next(addToken(req, accesstoken)))
    );
  }
}