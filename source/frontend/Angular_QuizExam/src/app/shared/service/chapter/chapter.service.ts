import { Injectable } from '@angular/core';
import { AuthService } from '../auth.service';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ChapterRequest, ChapterResponse } from '../../models/chapter.model';

@Injectable({
  providedIn: 'root'
})
export class ChapterService {
  private chapterApi: string;
  
  constructor(private authService: AuthService, private http: HttpClient) {
    this.chapterApi = `${this.authService.apiUrl}/chapter`;
  }

  getChapterList(subjectId: number): Observable<ChapterResponse[]> {
    return this.http.get<ChapterResponse[]>(`${this.chapterApi}/${subjectId}`, this.authService.httpOptions);
  }

  getChapterById(id: number): Observable<ChapterResponse> {
    return this.http.get<ChapterResponse>(`${this.chapterApi}/find/${id}`, this.authService.httpOptions);
  }

  createChapter(chapterForm: ChapterRequest): Observable<ChapterResponse> {
    return this.http.post<ChapterResponse>(`${this.chapterApi}`, chapterForm, this.authService.httpOptions);
  }

  updateChapter(id: number, chapterForm: ChapterRequest): Observable<ChapterResponse> {
    return this.http.put<ChapterResponse>(`${this.chapterApi}/${id}`, chapterForm, this.authService.httpOptions);
  }

  deleteChapter(id: number): Observable<ChapterResponse> {
    return this.http.put<ChapterResponse>(`${this.chapterApi}/delete/${id}`, {}, this.authService.httpOptions);
  }
}