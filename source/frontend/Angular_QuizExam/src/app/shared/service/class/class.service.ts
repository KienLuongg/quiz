import { Injectable } from '@angular/core';
import { AuthService } from '../auth.service';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ClassResponse, ClassRequest } from '../../models/class.model';

@Injectable({
  providedIn: 'root'
})
export class ClassService {
  private classApi: string;
  
  constructor(private authService: AuthService, private http: HttpClient) {
    this.classApi = `${this.authService.apiUrl}/class`;
  }

  getClassList(): Observable<ClassResponse[]> {
    return this.http.get<ClassResponse[]>(`${this.classApi}`, this.authService.httpOptions);
  }

  getClassById(id: number): Observable<ClassResponse> {
    return this.http.get<ClassResponse>(`${this.classApi}/${id}`, this.authService.httpOptions);
  }

  createClass(classForm: ClassRequest): Observable<ClassResponse> {
    return this.http.post<ClassResponse>(`${this.classApi}`, classForm, this.authService.httpOptions);
  }

  updateClass(id: number, classForm: ClassRequest): Observable<ClassResponse> {
    return this.http.put<ClassResponse>(`${this.classApi}/${id}`, classForm, this.authService.httpOptions);
  }

  deleteClass(id: number): Observable<ClassResponse> {
    return this.http.put<ClassResponse>(`${this.classApi}/remove/${id}`, {}, this.authService.httpOptions);
  }
}