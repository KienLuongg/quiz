import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SubjectComponent } from './subject.component';
import { ListComponent } from './list/list.component';
import { ChapterComponent } from './chapter/chapter.component';
import { QuestionListComponent } from './question-list/question-list.component';
import { QuestionFormComponent } from './question-form/question-form.component';
import { AuthGuard } from '../../service/authguard.service';
import { QuestionUpdateComponent } from './question-update/question-update.component';
import { Roles } from '../../../shared/enums';

const routes: Routes = [
  {
    path: '',
    component: SubjectComponent,
    children: [
      {
        path: '',
        component: ListComponent,
        canActivate: [AuthGuard],
        data: { roles: [Roles.ADMIN, Roles.DIRECTOR, Roles.TEACHER] },
      },
      {
        path: ':subjectId',
        component: ChapterComponent,
        canActivate: [AuthGuard],
        data: { roles: [Roles.ADMIN, Roles.TEACHER] },
      },
      {
        path: ':subjectId/question-list',
        component: QuestionListComponent,
        canActivate: [AuthGuard],
        data: { roles: [Roles.ADMIN, Roles.DIRECTOR, Roles.TEACHER] },
      },
      {
        path: ':subjectId/add-new-question',
        component: QuestionFormComponent,
        canActivate: [AuthGuard],
        data: { roles: [Roles.ADMIN, Roles.TEACHER] },
      },
      {
        path: ':subjectId/edit-question/:id',
        component: QuestionUpdateComponent,
        canActivate: [AuthGuard],
        data: { roles: [Roles.ADMIN, Roles.TEACHER] },
      },
    ],
    canActivate: [AuthGuard],
    data: { roles: [Roles.ADMIN, Roles.DIRECTOR, Roles.TEACHER] },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SubjectRoutingModule { }