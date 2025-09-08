import { Injectable } from '@angular/core';
import { AuthService } from '../auth.service';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { StudentRequest, StudentResponse, UpdateStudentClassRequest } from '../../models/student.model';

@Injectable({
  providedIn: 'root'
})
export class StudentService {
  private studentApi: string;
  
  constructor(private authService: AuthService, private http: HttpClient) {
    this.studentApi = `${this.authService.apiUrl}/student`;
  }

  getStudentList(classId: number, statusId: number): Observable<StudentResponse[]> {
    const endpointUrl = (isNaN(classId) || classId == 0) ? `${statusId}` : `${statusId}/${classId}`;
    return this.http.get<StudentResponse[]>(`${this.studentApi}/${endpointUrl}`, this.authService.httpOptions);
  }

  getStudentById(id: number): Observable<StudentResponse> {
    return this.http.get<StudentResponse>(`${this.studentApi}/find/${id}`, this.authService.httpOptions);
  }

  createStudent(studentForm: StudentRequest): Observable<StudentResponse> {
    return this.http.post<StudentResponse>(`${this.studentApi}`, studentForm, this.authService.httpOptions);
  }

  updateStudent(id: number, studentForm: StudentRequest): Observable<StudentResponse> {
    return this.http.put<StudentResponse>(`${this.studentApi}/${id}`, studentForm, this.authService.httpOptions);
  }

  getStudentsMovingToClass(userIds: number[]): Observable<StudentResponse[]> {
    const params = `?userIds=${userIds.join('&userIds=')}`
    return this.http.get<StudentResponse[]>(`${this.studentApi}/moving-to-class${params}`, this.authService.httpOptions);
  }

  updateStudentClass(studentClass: UpdateStudentClassRequest): Observable<StudentResponse[]> {
    return this.http.put<StudentResponse[]>(`${this.studentApi}/update-class`, studentClass, this.authService.httpOptions);
  }

  resetPasswordStudent(id: number): Observable<StudentResponse> {
    return this.http.put<StudentResponse>(`${this.studentApi}/reset-password/${id}`, {}, this.authService.httpOptions);
  }

  removeStudent(id: number): Observable<StudentResponse> {
    return this.http.put<StudentResponse>(`${this.studentApi}/remove/${id}`, {}, this.authService.httpOptions);
  }

  restoreStudent(id: number): Observable<StudentResponse> {
    return this.http.put<StudentResponse>(`${this.studentApi}/restore/${id}`, {}, this.authService.httpOptions);
  }

  getStudentListForExam(statusId: number, classId: number, examId: number): Observable<StudentResponse[]> {
    return this.http.get<StudentResponse[]>(`${this.studentApi}/${statusId}/${classId}/${examId}`, this.authService.httpOptions);
  }

  countAllStudents(): Observable<number> {
    return this.http.get<number>(`${this.studentApi}/count`, this.authService.httpOptions);
  }
}