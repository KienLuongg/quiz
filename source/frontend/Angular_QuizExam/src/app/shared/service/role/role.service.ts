import { Injectable } from '@angular/core';
import { AuthService } from '../auth.service';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Role, Permission } from '../../models/role.model';

@Injectable({
  providedIn: 'root'
})
export class RoleService {
  private id: number = 0;

  setId(id: number): void {
    this.id = id;
  }

  getId(): number {
    return this.id;
  }
  
  private roleApi: string;

  private permissionApi: string;
  
  constructor(private authService: AuthService, private http: HttpClient) {
    this.roleApi = `${this.authService.apiUrl}/role`;
    this.permissionApi = `${this.authService.apiUrl}/permission`;
  }

  getRoleList(): Observable<Role[]> {
    return this.http.get<Role[]>(`${this.roleApi}`, this.authService.httpOptions);
  }

  getRoleListToEmployee(): Observable<Role[]> {
    return this.http.get<Role[]>(`${this.roleApi}/employee`, this.authService.httpOptions);
  }

  getRoleById(id: number): Observable<Role> {
    return this.http.get<Role>(`${this.roleApi}/${id}`, this.authService.httpOptions);
  }

  getPermissionList(roleId: number): Observable<Permission[]> {
    return this.http.get<Permission[]>(`${this.permissionApi}/${roleId}`, this.authService.httpOptions);
  }
}