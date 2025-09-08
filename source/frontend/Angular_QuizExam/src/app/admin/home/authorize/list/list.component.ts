import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../../shared/service/auth.service';
import { Title } from '@angular/platform-browser';
import { AdminComponent } from '../../../admin.component';
import { Role } from '../../../../shared/models/role.model';
import { RoleService } from '../../../../shared/service/role/role.service';
import { UrlService } from '../../../../shared/service/url.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: [
    './../../../../shared/styles/admin/style.css',
    './list.component.css'
  ]
})
export class ListComponent implements OnInit{
  roleList: Role[] = [];

  constructor(
    private authService: AuthService,
    private titleService: Title,
    public admin: AdminComponent,
    private roleService: RoleService,
    public urlService: UrlService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.titleService.setTitle('Authorize');
    this.loadData();
  }

  loadData(): void {
    this.roleService.getRoleList().subscribe({
      next: (roleResponse) => {
        this.roleList = roleResponse;
      },
      error: (err) => {
        this.authService.handleError(err, undefined, '', 'load data');
      }
    });
  }

  getPermission(id: number): void {
    this.roleService.setId(id);
    this.router.navigate([this.urlService.getAuthorizeDetailUrl('ADMIN')]);
  }
}