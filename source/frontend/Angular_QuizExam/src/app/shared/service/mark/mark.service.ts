import { Injectable } from '@angular/core';
import { AuthService } from '../auth.service';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MarkResponse, PassPercentage } from '../../models/mark.model';

@Injectable({
  providedIn: 'root'
})
export class MarkService {
  private markApi: string;
  
  constructor(private authService: AuthService, private http: HttpClient) {
    this.markApi = `${this.authService.apiUrl}/mark`;
  }
  
  getMarkListByExam(examId: number): Observable<MarkResponse[]> {
    return this.http.get<MarkResponse[]>(`${this.markApi}/find-all/${examId}`, this.authService.httpOptions);
  }

  getMarkListBySem(semId: number): Observable<MarkResponse[]> {
    return this.http.get<MarkResponse[]>(`${this.markApi}/sem/${semId}`, this.authService.httpOptions);
  }

  getMarkListBySemAndStudent(semId: number, studentId: number): Observable<MarkResponse[]> {
    return this.http.get<MarkResponse[]>(`${this.markApi}/sem-and-student/${semId}/${studentId}`, this.authService.httpOptions);
  }

  getMarkByExam(examId: number): Observable<MarkResponse> {
    return this.http.get<MarkResponse>(`${this.markApi}/${examId}`, this.authService.httpOptions);
  }

  updateMark(examId: number, studentIds: number[]): Observable<MarkResponse[]> {
    return this.http.put<MarkResponse[]>(`${this.markApi}/${examId}`, studentIds, this.authService.httpOptions);
  }

  updateBeginTime(id: number): Observable<MarkResponse> {
    return this.http.put<MarkResponse>(`${this.markApi}/begin-time/${id}`, {}, this.authService.httpOptions);
  }

  updateWarning(id: number, warningCount: number): Observable<MarkResponse> {
    return this.http.put<MarkResponse>(`${this.markApi}/warning/${id}`, { warning: warningCount }, this.authService.httpOptions);
  }

  getPassPercentageBySubject(): Observable<PassPercentage[]> {
    return this.http.get<PassPercentage[]>(`${this.markApi}/pass-percentage`, this.authService.httpOptions);
  }
}