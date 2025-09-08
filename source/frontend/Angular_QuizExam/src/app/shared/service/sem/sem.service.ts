import { Injectable } from '@angular/core';
import { AuthService } from '../auth.service';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Sem, SemRequest } from '../../models/sem.model';

@Injectable({
  providedIn: 'root'
})
export class SemService {
  private semApi: string;

  constructor(private authService: AuthService, private http: HttpClient) {
    this.semApi = `${this.authService.apiUrl}/sem`;
  }

  getSemList(): Observable<Sem[]> {
    return this.http.get<Sem[]>(`${this.semApi}`, this.authService.httpOptions);
  }

  getSemById(id: number): Observable<Sem> {
    return this.http.get<Sem>(`${this.semApi}/${id}`, this.authService.httpOptions);
  }

  createSem(semForm: SemRequest): Observable<Sem> {
    return this.http.post<Sem>(`${this.semApi}`, semForm, this.authService.httpOptions);
  }

  updateSem(id: number, semForm: SemRequest): Observable<Sem> {
    return this.http.put<Sem>(`${this.semApi}/${id}`, semForm, this.authService.httpOptions);
  }
}