import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment.development';
import { HttpClient } from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';
import { RegisterUser } from '../../models/registerUser';
import { AuthUser } from '../../models/authUser';
import { jwtDecode } from 'jwt-decode';
import { Observable, tap } from 'rxjs';
import { LoginUser } from '../../models/loginUser';
import { JwtPayload } from '../../models/jwtPayload';
import { tokenModel } from '../../models/tokenMode';
import { ApiResponse } from '../../models/apiResponse';
import { UserResponse } from '../../models/userResponse';
@Injectable({
  providedIn: 'root',
})
export class AuthService {
    private readonly controller= "Auth"
    private readonly env = `${environment.RpxDexApi}/${this.controller}`
    private readonly JWT_Token = "JWTString";
    private readonly REFRESH_Token = "REFRESHTOKEN";

    
    constructor(private http: HttpClient, private cookieService: CookieService) {}

    public Register(authUser: RegisterUser): Observable<boolean>{
      return this.http.post<boolean>(this.env,authUser);
    }
    
    public Login(user: LoginUser): Observable<ApiResponse<tokenModel>>{
       return this.http.post<ApiResponse<tokenModel>>(`${this.env}/Login`, user).pipe(
        tap(token => {
          console.log('Token recebido:', token);
            this.cookieService.set(this.JWT_Token, token.data!.accessToken);
            this.cookieService.set(this.REFRESH_Token,token.data!.refreshToken);
        })
       );
    }
  public RefreshToken(token: tokenModel): Observable<ApiResponse<tokenModel>>{
       return this.http.post<ApiResponse<tokenModel>>(`${this.env}/RefreshToken`, token).pipe(
        tap(newToken => {
            this.cookieService.set(this.REFRESH_Token,newToken.data!.refreshToken);
            this.cookieService.set(this.JWT_Token, newToken.data!.accessToken);

        })
       );
    }
    public GetLoggedUser() : UserResponse
    {
      const jwtToken =this.cookieService.get(this.JWT_Token);
      var decodedToken = jwtDecode<JwtPayload>(jwtToken);
      // const user : AuthUser ={
      //   id: decodedToken.sub,
      //   userName: decodedToken.unique_name,
      //   email: decodedToken.email,
      //   roles: decodedToken['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] ??[]
      // };
      let userResponse : UserResponse;
      this.http.get<ApiResponse<UserResponse>>(`${environment.RpxDexApi}/User/${decodedToken.sub}`).subscribe(user => {
      userResponse = user.data!;
      });
      return userResponse!;
    }

    public isLoggedIn(): boolean {
      return this.cookieService.check(this.JWT_Token);
    }

    public Logout(): void {
      this.cookieService.delete(this.JWT_Token, '/');
    }
}