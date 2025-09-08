import { Injectable } from '@angular/core';
import { AuthService } from '../auth.service';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ExaminationRequest, ExaminationResponse } from '../../models/examination.model';

@Injectable({
  providedIn: 'root'
})
export class ExaminationService {
  private examApi: string;
  
  constructor(private authService: AuthService, private http: HttpClient) {
    this.examApi = `${this.authService.apiUrl}/exam`;
  }

  getExamListForStudent(): Observable<ExaminationResponse[]> {
    return this.http.get<ExaminationResponse[]>(`${this.examApi}`, this.authService.httpOptions);
  }

  getExamListBySem(semId: number): Observable<ExaminationResponse[]> {
    return this.http.get<ExaminationResponse[]>(`${this.examApi}/sem/${semId}`, this.authService.httpOptions);
  }

  getExamDetailById(id: number): Observable<ExaminationResponse> {
    return this.http.get<ExaminationResponse>(`${this.examApi}/${id}`, this.authService.httpOptions);
  }

  createAutoExam(examForm: ExaminationRequest): Observable<ExaminationResponse> {
    return this.http.post<ExaminationResponse>(`${this.examApi}`, examForm, this.authService.httpOptions);
  }

  createExamWithQuestions(examForm: ExaminationRequest, questionIds: number[]): Observable<ExaminationResponse> {
    const formData = new FormData();
    formData.append('exam', new Blob([JSON.stringify(examForm)], { type: 'application/json' }));
    formData.append('question', new Blob([JSON.stringify(questionIds)], { type: 'application/json' }));
    return this.http.post<ExaminationResponse>(`${this.examApi}/select-questions`, formData, this.authService.httpOptions);
  }

  updateExamInfo(examId: number, examForm: ExaminationRequest): Observable<ExaminationResponse> {
    return this.http.put<ExaminationResponse>(`${this.examApi}/${examId}`, examForm, this.authService.httpOptions);
  }

  updateQuestionsInExam(examId: number, questionIds: number[]): Observable<ExaminationResponse> {
    return this.http.put<ExaminationResponse>(`${this.examApi}/update-question/${examId}`, questionIds, this.authService.httpOptions);
  }

  countAllExams(): Observable<number> {
    return this.http.get<number>(`${this.examApi}/count`, this.authService.httpOptions);
  }

  getExamListBySubject(subjectId: number): Observable<ExaminationResponse[]> {
    return this.http.get<ExaminationResponse[]>(`${this.examApi}/subject/${subjectId}`, this.authService.httpOptions);
  }

  getFinishedExamsBySem(semId: number): Observable<ExaminationResponse[]> {
    return this.http.get<ExaminationResponse[]>(`${this.examApi}/finish/sem/${semId}`, this.authService.httpOptions);
  }
}