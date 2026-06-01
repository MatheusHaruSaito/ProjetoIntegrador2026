import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment.development';
import { HttpClient } from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';
import { RegisterUser } from '../../models/registerUser';
import { jwtDecode } from 'jwt-decode';
import { BehaviorSubject, Observable, tap, map, catchError } from 'rxjs';
import { LoginUser } from '../../models/loginUser';
import { JwtPayload } from '../../models/jwtPayload';
import { tokenModel } from '../../models/tokenMode';
import { ApiResponse } from '../../models/apiResponse';
import { UserResponse } from '../../models/userResponse';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly controller = 'Auth';
  private readonly env = `${environment.RpxDexApi}/${this.controller}`;
  private readonly JWT_Token = 'JWTString';
  private readonly REFRESH_Token = 'REFRESHTOKEN';

  private currentUserSubject: BehaviorSubject<any>;
  public currentUser: Observable<any>;

  constructor(private http: HttpClient, private cookieService: CookieService) {
    this.currentUserSubject = new BehaviorSubject<any>(this.cookieService.get(this.JWT_Token));
    this.currentUser = this.currentUserSubject.asObservable();
  }

  public get currentUserValue() {
    return this.currentUserSubject.value;
  }

  public Register(authUser: RegisterUser): Observable<boolean> {
    return this.http.post<boolean>(this.env, authUser);
  }

  public Login(user: LoginUser): Observable<ApiResponse<tokenModel>> {
    return this.http.post<ApiResponse<tokenModel>>(`${this.env}/Login`, user).pipe(
      map((response: ApiResponse<tokenModel>) => {
        if(response.success && response.data) {
          this.cookieService.set(this.JWT_Token, response.data!.accessToken);
          this.cookieService.set(this.REFRESH_Token, response.data!.refreshToken);
          this.currentUserSubject.next(response.data);
        }
        return response;
      })
      // tap(token => {
      //   this.cookieService.set(this.JWT_Token, token.data!.accessToken);
      //   this.cookieService.set(this.REFRESH_Token, token.data!.refreshToken);
      // })
    );
  }


  public RefreshToken(): Observable<ApiResponse<tokenModel>> {

    const tokenModel: tokenModel = {
      accessToken: this.cookieService.get(this.JWT_Token) || '',
      refreshToken: this.cookieService.get(this.REFRESH_Token) || ''
    }
    return this.http.post<ApiResponse<tokenModel>>(`${this.env}/RefreshToken`, tokenModel).pipe(
      map((response: ApiResponse<tokenModel>) => {
        if(response.success && response.data?.accessToken) {
          const currentUser = this.currentUserValue;
          currentUser.accessToken = response.data.accessToken;
          this.cookieService.set(this.JWT_Token, response.data.accessToken);
          this.currentUserSubject.next(currentUser);
        }
        return response;
      }),
      catchError((error) => {
        this.Logout();
        throw error;
      }
      // tap(newToken => {
      //   this.cookieService.set(this.JWT_Token, newToken.data!.accessToken);
      //   this.cookieService.set(this.REFRESH_Token, newToken.data!.refreshToken);
      // })
    ));
  }

  // Retorna Observable — o componente assina e recebe o dado quando chegar
  public GetLoggedUser(): Observable<ApiResponse<UserResponse>> {
    const jwtToken = this.cookieService.get(this.JWT_Token);
    const decodedToken = jwtDecode<JwtPayload>(jwtToken);
    return this.http.get<ApiResponse<UserResponse>>(
      `${environment.RpxDexApi}/User/${decodedToken.sub}`
    );
  }

  // Utilitário para ler o sub do token sem fazer request (ex: filtros locais)
  public getLoggedUserId(): string | undefined {
    const jwtToken = this.cookieService.get(this.JWT_Token);
    if (!jwtToken) return undefined;
    return jwtDecode<JwtPayload>(jwtToken).sub;
  }

  public isLoggedIn(): boolean {
    return this.cookieService.check(this.JWT_Token);
  }

  public Logout(): void {
    this.cookieService.delete(this.JWT_Token, '/');
    this.cookieService.delete(this.REFRESH_Token, '/');
    this.currentUserSubject.next(null);
  }
}