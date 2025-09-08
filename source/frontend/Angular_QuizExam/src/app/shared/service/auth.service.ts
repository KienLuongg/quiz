import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { LoginRequest, LoginResponse, ChangePassword, ValidationError } from '../models/models';
import { Role } from '../models/role.model';
import { UserResponse } from '../models/user.model';
import { StudentResponse } from '../models/student.model';
import { TokenKey, RoleKey } from '../enums';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  apiUrl = 'https://quizexam-production.up.railway.app/api';

  employeeProfile: UserResponse = { } as UserResponse;

  studentProfile: StudentResponse = { } as StudentResponse;

  entityExporter = '';

  listExporter: any;

  httpOptions: { headers: HttpHeaders; responseType: 'json'; withCredentials: true } = {
    headers: new HttpHeaders({'Accept': 'application/json'}),
    responseType: 'json',
    withCredentials: true
  };

  constructor(private http: HttpClient, private toastr: ToastrService, private router: Router) {
    this.initializeEmployee();
    this.initializeStudent();
  }

  initializeEmployee(): void {
    this.employeeProfile = {
      id: 0, fullName: '', dob: new Date(), gender: 0, address: '', phoneNumber: '', email: '',
      role: { id: 0, name: '', description: '' }
    };
  }

  initializeStudent(): void {
    this.studentProfile = {
      userResponse: this.employeeProfile, rollPortal: '', rollNumber: '',
      classes: { id: 0, name: '', classDay: '', classTime: '', admissionDate: new Date(), status: 0 }
    };
  }

  login(loginRequest: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/auth/login`, loginRequest, { responseType: 'json' });
  }

  takeRole(header: HttpHeaders): Observable<Role> {
    return this.http.get<Role>(`${this.apiUrl}/auth/role`, { headers: header, responseType: 'json' });
  }

  getProfile(): Observable<UserResponse | StudentResponse> {
    return this.http.get<UserResponse | StudentResponse>(`${this.apiUrl}/auth/profile`, this.httpOptions);
  }

  changePassword(changePasswordForm: ChangePassword): Observable<UserResponse> {
    return this.http.put<UserResponse>(`${this.apiUrl}/auth/change-password`, changePasswordForm, this.httpOptions);
  }

  handleError(err: any, validationError: ValidationError = {}, field: string, action: string, reloadTable?: () => void): void {
    console.log(err);
    if (err.status === 401) {
      this.toastr.error('Unauthorized access. Please check your login credentials.', 'Failed', { timeOut: 5000 });
    }
    else if (err.status === 403) {
      this.toastr.error('You do not have permission to access this resource.', 'Error', { timeOut: 5000 });
    }
    else if (err.status === 0) {
      // Nếu status là 0, có thể là lỗi mạng hoặc API không phản hồi
      this.toastr.error('Cannot connect to the server. Please check your connection or try again later.', 'Error', { timeOut: 5000 });
    }
    else {
      if (err.error?.message) {
        validationError[err.error.key] = err.error.message;
      }
      else if (Array.isArray(err.error)) {
        err.error.forEach((e: any) => {
          validationError[e.key] = e.message;
        });
      }

      let errorMessage = `Failed to ${action}. Please try again.`;
      // Kiểm tra nếu có lỗi cho trường `field`
      if (validationError[field]?.trim()) {
        // Kiểm tra nếu `reloadTable` có được truyền vào (không phải là `undefined`)
        if (reloadTable) {
          errorMessage = `${validationError[field]}<br>Reloading table in 5 seconds...`;
          setTimeout(() => reloadTable(), 5000);
        }
        else {
          errorMessage = `${validationError[field]}`;
        }
      }
      this.toastr.error(errorMessage, 'Error', { timeOut: 5000, enableHtml: true });
    }
  }

  // Kiểm tra xem localStorage có sẵn không trước khi sử dụng
  isLocalStorageAvailable(): boolean {
    return typeof localStorage !== 'undefined';
  }

  loadToken(tokenKey: TokenKey): boolean {
    if (this.isLocalStorageAvailable()) {
      const token = localStorage.getItem(tokenKey);
      if (token) {
        this.httpOptions = {
          headers: new HttpHeaders({ 
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }),
          responseType: 'json',
          withCredentials: true
        };
        return true;
      }
    }
    return false;
  }

  loadProfile(tokenKey: TokenKey): void {
    if (this.loadToken(tokenKey)) {
      const token = localStorage.getItem(tokenKey);
      this.getProfile().subscribe({
        next: (profileResponse) => {
          // Kiểm tra nếu profileResponse có thuộc tính 'userResponse', tức là nó là student
          if (this.isStudentResponse(profileResponse)) {
            this.handleStudentProfile(tokenKey, token, profileResponse);
          }
          else {
            this.handleEmployeeProfile(tokenKey, token, profileResponse);
          }
        },
        error: (err) => {
          this.logout(tokenKey);
          console.log('Error: ', err);
        }
      });
    }
    else {
      this.router.navigate([tokenKey == TokenKey.STUDENT ? '/login' : 'admin/login']);
    }
  }

  // Hàm kiểm tra nếu profileResponse là StudentResponse
  isStudentResponse(profileResponse: any): profileResponse is StudentResponse {
    return (profileResponse as StudentResponse).userResponse !== undefined;
  }

  handleStudentProfile(tokenKey: TokenKey, token: string | null, profileResponse: StudentResponse): void {
    if (tokenKey == TokenKey.ADMIN) {
      // Nếu là token admin mà lấy ra profile lại là student, thực hiện chuyển token và điều hướng
      localStorage.setItem(TokenKey.STUDENT, JSON.stringify(token));
      localStorage.removeItem(TokenKey.ADMIN);
      this.router.navigate(['admin/login']);
      return;
    }
    this.studentProfile = profileResponse;
    localStorage.setItem(RoleKey.STUDENT, profileResponse.userResponse.role.name);
  }
  
  handleEmployeeProfile(tokenKey: TokenKey, token: string | null, profileResponse: UserResponse): void {
    if (tokenKey == TokenKey.STUDENT) {
      // Nếu là token student mà lấy ra profile lại là admin, thực hiện chuyển token và điều hướng
      localStorage.setItem(TokenKey.ADMIN, JSON.stringify(token));
      localStorage.removeItem(TokenKey.STUDENT);
      this.router.navigate(['/login']);
      return;
    }
    this.employeeProfile = profileResponse;
    localStorage.setItem(RoleKey.ADMIN, profileResponse.role.name);
  }

  logout(tokenKey: TokenKey): void {
    localStorage.removeItem(tokenKey);
    if (tokenKey == TokenKey.ADMIN) {
      this.initializeEmployee();
      localStorage.removeItem(RoleKey.ADMIN);
    }
    if (tokenKey == TokenKey.STUDENT) {
      this.initializeStudent();
      localStorage.removeItem(RoleKey.STUDENT);
    }
    this.router.navigate([tokenKey == TokenKey.STUDENT ? '/login' : 'admin/login']);
  }

  exportDataExcel() {
    const token = localStorage.getItem(TokenKey.ADMIN) || null;
    const headers = new HttpHeaders().set('Authorization', 'Bearer ' + token).set('Content-Type', 'application/json');
    return this.http.post(`${this.apiUrl}/${this.entityExporter}/export/excel`, this.listExporter, { headers: headers, responseType: 'blob', });
  }

  exportDataPDF() {
    const token = localStorage.getItem(TokenKey.ADMIN) || null;
    const headers = new HttpHeaders().set('Authorization', 'Bearer ' + token).set('Content-Type', 'application/json');
    return this.http.post(`${this.apiUrl}/${this.entityExporter}/export/pdf`, this.listExporter, { headers: headers, responseType: 'blob', });
  }
}
