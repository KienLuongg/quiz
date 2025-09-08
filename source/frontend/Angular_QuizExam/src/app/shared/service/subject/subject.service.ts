import { Injectable } from '@angular/core';
import { AuthService } from '../auth.service';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Sem } from '../../models/sem.model';
import { SubjectRequest, SubjectResponse } from '../../models/subject.model';

@Injectable({
  providedIn: 'root'
})
export class SubjectService {
  private subjectApi: string;

  constructor(private authService: AuthService, private http: HttpClient) {
    this.subjectApi = `${this.authService.apiUrl}/subject`;
  }

  getAllSubjectList(): Observable<SubjectResponse[]> {
    return this.http.get<SubjectResponse[]>(`${this.subjectApi}`, this.authService.httpOptions);
  }

  getSubjectListBySem(semId: number): Observable<SubjectResponse[]> {
    return this.http.get<SubjectResponse[]>(`${this.subjectApi}/sem/${semId}`, this.authService.httpOptions);
  }

  getSubjectById(id: number): Observable<SubjectResponse> {
    return this.http.get<SubjectResponse>(`${this.subjectApi}/${id}`, this.authService.httpOptions);
  }

  createSubject(subjectForm: SubjectRequest): Observable<SubjectResponse> {
    const formData = new FormData();
    formData.append('file', subjectForm.file || new Blob());
    formData.append('subject', new Blob([JSON.stringify(subjectForm)], { type: 'application/json' }));
    return this.http.post<SubjectResponse>(`${this.subjectApi}`, formData, this.authService.httpOptions);
  }

  updateSubject(id: number, subjectForm: SubjectRequest, changeImg: boolean): Observable<SubjectResponse> {
    const formData = new FormData();
    if (changeImg) {
      formData.append('file', subjectForm.file || new Blob());
    }
    formData.append('subject', new Blob([JSON.stringify(subjectForm)], { type: 'application/json' }));
    return this.http.put<SubjectResponse>(`${this.subjectApi}/${id}`, formData, this.authService.httpOptions);
  }

  deleteSubject(id: number): Observable<SubjectResponse> {
    return this.http.put<SubjectResponse>(`${this.subjectApi}/remove/${id}`, {}, this.authService.httpOptions);
  }
}