import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment.development';
import { HttpClient } from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';
import { registerUser } from '../../models/registerUser';
import { authUser } from '../../models/authUser';
import { jwtDecode } from 'jwt-decode';
import { Observable, tap } from 'rxjs';
import { loginUser } from '../../models/loginUser';
import { jwtPayload } from '../../models/jwtPayload';
@Injectable({
  providedIn: 'root',
})
export class AuthService {
    private readonly env = `${environment.RpxDexApi}/Auth`
    private readonly JWT_Token = "JWTString";
  constructor(private http: HttpClient, private cookieService: CookieService) {
    }

    public Register(authUser: registerUser): Observable<String>{
      return this.http.post<String>(this.env,authUser);
    }
    
    public Login(user: loginUser): Observable<{token: string}>{
       return this.http.post<{token: string}>(`${this.env}/Login`, user).pipe(
        tap(jwtToken => {
            let token = jwtToken.token;
            this.cookieService.set(this.JWT_Token,token)
        })
       )
    }

    public GetLoggedUser() : authUser
    {
      const jwtToken =this.cookieService.get(this.JWT_Token);
      var decodedToken = jwtDecode<jwtPayload>(jwtToken);
      const user : authUser ={
        id: decodedToken.sub,
        username: decodedToken.unique_name,
        email: decodedToken.email,
        roles: ["Default"] //Ainda não implementado
      };
      return user;
    }
}
