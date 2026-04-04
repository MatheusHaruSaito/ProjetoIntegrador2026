import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment.development';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { registerUser } from '../../models/registerUser';
import { CookieService } from 'ngx-cookie-service'
import { authUser } from '../../models/authUser';
import { jwtDecode } from "jwt-decode";
import { email } from '@angular/forms/signals';
@Injectable({
  providedIn: 'root',
})
export class Auth {
  private readonly env = `${environment.RpxDexApi}/Auth`
  private readonly JWT_Token = "JWTString";
  constructor(private http: HttpClient, private cookieService: CookieService) {
  }

  private Register(authUser: registerUser): Observable<String> {
    return this.http.post<String>(this.env, authUser);
  }
  public LogIn(authUser: registerUser): Observable<string> {
    return this.http.post<string>(this.env, authUser);
  }

    private GetLoggedUser() : authUser
{
  const jwtToken = this.cookieService.get(this.JWT_Token);
  var decodedToken = jwtDecode<jwtPayload>(jwtToken);
  const user: authUser = {
    id: decodedToken.sub,
    username: decodedToken.unique_name,
    email: decodedToken.email,
    roles: ["Default"] //Ainda não implementado
  };
  return user;
}

}

