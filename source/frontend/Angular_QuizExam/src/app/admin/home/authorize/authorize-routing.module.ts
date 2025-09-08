
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../../service/authguard.service';

import { AuthorizeComponent } from './authorize.component';
import { ListComponent } from './list/list.component';
import { DetailComponent } from './detail/detail.component';
import { Roles } from '../../../shared/enums';

const routes: Routes = [
  {
    path: '',
    component: AuthorizeComponent,
    children: [
      {
        path: '',
        component: ListComponent,
      },
      {
        path: 'detail',
        component: DetailComponent,
      },
    ],
    canActivate: [AuthGuard],
    data: { roles: [Roles.ADMIN, Roles.DIRECTOR, Roles.TEACHER, Roles.SRO] },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuthorizeRoutingModule { }
