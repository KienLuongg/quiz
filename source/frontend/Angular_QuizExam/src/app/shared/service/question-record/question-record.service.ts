import { Injectable } from '@angular/core';
import { AuthService } from '../auth.service';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class QuestionRecordService {
  private questionRecordApi: string;
    
  constructor(private authService: AuthService, private http: HttpClient) {
    this.questionRecordApi = `${this.authService.apiUrl}/question-record`;
  }
  
  getMaxScoreByLevelForExam(examId: number): Observable<{ [key: string]: number }> {
    return this.http.get<{ [key: string]: number }>(`${this.questionRecordApi}/max-score-level/${examId}`, this.authService.httpOptions);
  }
}