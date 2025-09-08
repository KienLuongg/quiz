import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../../service/authguard.service';
import { ExamComponent } from './exam.component';
import { ListComponent } from './list/list.component';
import { DetailComponent } from './detail/detail.component';
import { ResultComponent } from './result/result.component';
import { Roles } from '../../../shared/enums';

const routes: Routes = [
  {
    path: '',
    component: ExamComponent,
    canActivate: [AuthGuard],
    data: { roles: [Roles.STUDENT] },
    children: [
      {
        path: '',
        component: ListComponent,
      },
      {
        path: 'detail/:examId',
        component: DetailComponent
      },
      {
        path: 'result/:examId',
        component: ResultComponent,
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ExamRoutingModule { }