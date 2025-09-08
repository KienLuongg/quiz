import { Injectable } from '@angular/core';
import { AuthService } from '../auth.service';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { QuestionRequest, QuestionResponse } from '../../models/question.model';

@Injectable({
  providedIn: 'root'
})
export class QuestionService {
  private questionApi: string;
  
  constructor(private authService: AuthService, private http: HttpClient) {
    this.questionApi = `${this.authService.apiUrl}/question`;
  }

  getQuestionList(subjectId: number): Observable<QuestionResponse[]> {
    return this.http.get<QuestionResponse[]>(`${this.questionApi}/${subjectId}`, this.authService.httpOptions);
  }

  getQuestionById(id: number): Observable<QuestionResponse> {
    return this.http.get<QuestionResponse>(`${this.questionApi}/detail/${id}`, this.authService.httpOptions);
  }

  createQuestion(questionForms: QuestionRequest[]): Observable<QuestionResponse[]> {
    const formData = new FormData();
    formData.append('questions', new Blob([JSON.stringify(questionForms)], { type: 'application/json' }));
    questionForms.forEach((question) => {
      formData.append('files', question.file || new Blob());
    });
    return this.http.post<QuestionResponse[]>(`${this.questionApi}`, formData, this.authService.httpOptions);
  }

  updateQuestion(id: number, questionForm: QuestionRequest, changeImg: boolean): Observable<QuestionResponse> {
    const formData = new FormData();
    formData.append('question', new Blob([JSON.stringify(questionForm)], { type: 'application/json' }));
    if (changeImg) {
      formData.append('file', questionForm.file || new Blob());
    }
    return this.http.put<QuestionResponse>(`${this.questionApi}/${id}`, formData, this.authService.httpOptions);
  }

  deleteQuestion(id: number): Observable<QuestionResponse> {
    return this.http.put<QuestionResponse>(`${this.questionApi}/remove/${id}`, {}, this.authService.httpOptions);
  }

  getQuestionListByExam(examId: number): Observable<QuestionResponse[]> {
    return this.http.get<QuestionResponse[]>(`${this.questionApi}/exam/${examId}`, this.authService.httpOptions);
  }
}