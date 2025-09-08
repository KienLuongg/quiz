import { Injectable } from '@angular/core';
import { AuthService } from '../auth.service';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { LevelResponse, LevelRequest } from '../../models/level.model';

@Injectable({
  providedIn: 'root'
})
export class LevelService {
  private levelApi: string;
  
  constructor(private authService: AuthService, private http: HttpClient) {
    this.levelApi = `${this.authService.apiUrl}/level`;
  }

  getLevelList(): Observable<LevelResponse[]> {
    return this.http.get<LevelResponse[]>(`${this.levelApi}`, this.authService.httpOptions);
  }

  getLevelById(id: number): Observable<LevelResponse> {
    return this.http.get<LevelResponse>(`${this.levelApi}/${id}`, this.authService.httpOptions);
  }

  createLevel(levelForm: LevelRequest): Observable<LevelResponse> {
    return this.http.post<LevelResponse>(`${this.levelApi}`, levelForm, this.authService.httpOptions);
  }

  updateLevel(id: number, levelForm: LevelRequest): Observable<LevelResponse> {
    return this.http.put<LevelResponse>(`${this.levelApi}/${id}`, levelForm, this.authService.httpOptions);
  }

  deleteLevel(id: number): Observable<LevelResponse> {
    return this.http.put<LevelResponse>(`${this.levelApi}/delete/${id}`, {}, this.authService.httpOptions);
  }
}