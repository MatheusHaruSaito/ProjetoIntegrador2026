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
export class AuthService { // Verifique se o nome é AuthService
    private readonly env = `${environment.RpxDexApi}/Auth`
    private readonly JWT_Token = "JWTString";
    
    constructor(private http: HttpClient, private cookieService: CookieService) {}

    public Register(authUser: registerUser): Observable<any>{
      return this.http.post<any>(this.env, authUser);
    }
    
    public Login(user: loginUser): Observable<{token: string}>{
       return this.http.post<{token: string}>(`${this.env}/Login`, user).pipe(
        tap(jwtToken => {
            this.cookieService.set(this.JWT_Token, jwtToken.token);
        })
       );
    }

    public GetLoggedUser(): authUser {
      const jwtToken = this.cookieService.get(this.JWT_Token);
      var decodedToken = jwtDecode<jwtPayload>(jwtToken);
      return {
        id: decodedToken.sub,
        username: decodedToken.unique_name,
        email: decodedToken.email,
        roles: ["Default"]
      };
    }

    // Método essencial para a Navbar
    public isLoggedIn(): boolean {
      return this.cookieService.check(this.JWT_Token);
    }

    // Método para o botão de sair
    public Logout(): void {
      this.cookieService.delete(this.JWT_Token, '/');
    }
}