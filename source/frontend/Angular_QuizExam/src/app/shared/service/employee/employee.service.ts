import { Injectable } from '@angular/core';
import { AuthService } from '../auth.service';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UserResponse, UserRequest } from '../../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {
  private userApi: string;
  
  constructor(private authService: AuthService, private http: HttpClient) {
    this.userApi = `${this.authService.apiUrl}/user`;
  }

  getEmployeeList(statusId: number): Observable<UserResponse[]> {
    return this.http.get<UserResponse[]>(`${this.userApi}/${statusId}`, this.authService.httpOptions);
  }

  getEmployeeById(id: number): Observable<UserResponse> {
    return this.http.get<UserResponse>(`${this.userApi}/find/${id}`, this.authService.httpOptions);
  }

  createEmployee(employeeForm: UserRequest): Observable<UserResponse> {
    return this.http.post<UserResponse>(`${this.userApi}`, employeeForm, this.authService.httpOptions);
  }

  updateEmployee(id: number, employeeForm: UserRequest): Observable<UserResponse> {
    return this.http.put<UserResponse>(`${this.userApi}/${id}`, employeeForm, this.authService.httpOptions);
  }

  resetPasswordEmployee(id: number): Observable<UserResponse> {
    return this.http.put<UserResponse>(`${this.userApi}/reset-password/${id}`, {}, this.authService.httpOptions);
  }

  removeEmployee(id: number): Observable<UserResponse> {
    return this.http.put<UserResponse>(`${this.userApi}/remove/${id}`, {}, this.authService.httpOptions);
  }

  restoreEmployee(id: number): Observable<UserResponse> {
    return this.http.put<UserResponse>(`${this.userApi}/restore/${id}`, {}, this.authService.httpOptions);
  }

  countAllEmployees(): Observable<number> {
    return this.http.get<number>(`${this.userApi}/count`, this.authService.httpOptions);
  }
}