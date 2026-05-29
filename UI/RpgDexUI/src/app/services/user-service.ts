import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly controller = 'User';
  private readonly env = `${environment.RpxDexApi}/${this.controller}`;
    constructor(private http: HttpClient) { }

  Update(user: FormData, Id: string) {
    return this.http.put(this.env + '/' + Id, user);
  }
}
