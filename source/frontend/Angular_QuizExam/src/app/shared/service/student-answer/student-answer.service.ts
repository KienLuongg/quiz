import { Injectable } from '@angular/core';
import { AuthService } from '../auth.service';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { StudentAnswerRequest } from '../../models/student-answer.model';

@Injectable({
  providedIn: 'root'
})
export class StudentAnswerService {
  private studentAnswerApi: string;
      
  constructor(private authService: AuthService, private http: HttpClient) {
    this.studentAnswerApi = `${this.authService.apiUrl}/student-answers`;
  }
  
  getScoreByLevelOfStudentInExam(examId: number): Observable<{ [key: string]: number }> {
    return this.http.get<{ [key: string]: number }>(`${this.studentAnswerApi}/score-level/${examId}`, this.authService.httpOptions);
  }

  submitAnswers(submitAnswer: StudentAnswerRequest): Observable<StudentAnswerRequest> {
    return this.http.post<StudentAnswerRequest>(`${this.studentAnswerApi}`, submitAnswer, this.authService.httpOptions);
  }
}