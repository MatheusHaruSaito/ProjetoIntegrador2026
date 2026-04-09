import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment.development';
import { HttpClient } from '@angular/common/http';
import { Character } from '../../models/character';
import { Observable } from 'rxjs';
import { UpdateCharacter } from '../../models/updateCharacter';

@Injectable({
  providedIn: 'root',
})
export class CharacterService {
private readonly controller= "Character"
  private readonly env = `${environment.RpxDexApi}/${this.controller}`


  constructor(private http: HttpClient) {
    
  }

  public Post(character: Character): Observable<Character>{
    return this.http.post<Character>(this.env,character)
  }
  public GetAll(): Observable<Character>{
    return this.http.get<Character>(this.env)
  }
  public GetById(Id: String): Observable<Character>{
    return this.http.get<Character>(`${this.env}/${Id}`)
  }
  public Delete(Id: String): Observable<Character>{
    return this.http.delete<Character>(`${this.env}/${Id}`)
  }
  public Update(character: UpdateCharacter): Observable<Character>{
    return this.http.put<Character>(this.env,character)
  }
}
