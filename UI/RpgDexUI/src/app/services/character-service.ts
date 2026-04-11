import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment.development';
import { HttpClient } from '@angular/common/http';
import { Character } from '../../models/character';
import { Observable } from 'rxjs';
import { UpdateCharacter } from '../../models/updateCharacter';
import { ApiResponse } from '../../models/apiResponse';

@Injectable({
  providedIn: 'root',
})
export class CharacterService {
  private readonly controller = 'Character';
  private readonly env = `${environment.RpxDexApi}/${this.controller}`;

  constructor(private http: HttpClient) {}

  public Post(character: Character): Observable<ApiResponse<Character>> {
    return this.http.post<ApiResponse<Character>>(this.env, character);
  }

  public GetAll(): Observable<ApiResponse<Character[]>> {
    return this.http.get<ApiResponse<Character[]>>(this.env);
  }

  public GetById(Id: String): Observable<ApiResponse<Character>> {
    return this.http.get<ApiResponse<Character>>(`${this.env}/${Id}`);
  }

  public Delete(Id: String): Observable<ApiResponse<Character>> {
    return this.http.delete<ApiResponse<Character>>(`${this.env}/${Id}`);
  }

  public Update(character: UpdateCharacter): Observable<ApiResponse<Character>> {
    return this.http.put<ApiResponse<Character>>(this.env, character);
  }
}