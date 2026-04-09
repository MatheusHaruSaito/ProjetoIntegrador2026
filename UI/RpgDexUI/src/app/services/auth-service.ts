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
@Injectable({
  providedIn: 'root',
})
export class AuthService {
    private readonly controller= "Auth"
    private readonly env = `${environment.RpxDexApi}/${this.controller}`
    private readonly JWT_Token = "JWTString";
  constructor(private http: HttpClient, private cookieService: CookieService) {
    }

    public Register(authUser: RegisterUser): Observable<String>{
      return this.http.post<String>(this.env,authUser);
    }
    
    public Login(user: LoginUser): Observable<{token: string}>{
       return this.http.post<{token: string}>(`${this.env}/Login`, user).pipe(
        tap(jwtToken => {
            let token = jwtToken.token;
            this.cookieService.set(this.JWT_Token,token)
        })
       )
    }

    public GetLoggedUser() : AuthUser
    {
      const jwtToken =this.cookieService.get(this.JWT_Token);
      var decodedToken = jwtDecode<JwtPayload>(jwtToken);
      const user : AuthUser ={
        id: decodedToken.sub,
        username: decodedToken.unique_name,
        email: decodedToken.email,
        roles: decodedToken['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] ??[]
      };
      return user;
    }
}
