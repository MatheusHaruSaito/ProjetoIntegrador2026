import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { ApiResponse } from '../../models/apiResponse';
import { UserResponse } from '../../models/userResponse';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly controller = 'User';
  private readonly env = `${environment.RpxDexApi}/${this.controller}`;
  constructor(private http: HttpClient) {}

  Update(user: FormData, Id: string): Observable<ApiResponse<string>> {
    return this.http.put<ApiResponse<string>>(this.env + '/' + Id, user);
  }
  GetById(id: string): Observable<ApiResponse<UserResponse>> {
    return this.http.get<ApiResponse<UserResponse>>(`${this.env}/${id}`);
  }
}
