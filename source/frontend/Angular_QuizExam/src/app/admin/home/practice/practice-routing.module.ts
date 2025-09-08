
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../../service/authguard.service';

import { PracticeComponent } from './practice.component';
import { ListComponent } from './list/list.component';
import { DetailComponent } from './detail/detail.component';
import { AddFormComponent } from './add-form/add-form.component';
import { AddStudentComponent } from './add-student/add-student.component';
import { Roles } from '../../../shared/enums';

const routes: Routes = [
  {
    path: '',
    component: PracticeComponent,
    children: [
      {
        path: '',
        component: ListComponent,
      },
      {
        path: 'create',
        component: AddFormComponent,
      },
      {
        path: 'addStudent/:subjectId/:practiceId',
        component: AddStudentComponent,
      },
      {
        path: 'update/:practiceId',
        component: AddStudentComponent,
      },
      {
        path: 'detail/:practiceId',
        component: DetailComponent,
      },
    ],
    canActivate: [AuthGuard],
    data: { roles: [Roles.ADMIN, Roles.TEACHER] },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PraticeRoutingModule { }
