import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { EmployeeComponent } from './employee/employee.component';
import { ClassComponent } from './class/class.component';
import { StudentComponent } from './student/student.component';
import { ProfileComponent } from './profile/profile.component';
import { AuthGuard } from '../service/authguard.service';
import { LevelComponent } from './level/level.component';
import { Roles } from '../../shared/enums';
import { MarkComponent } from './mark/mark.component';
import { SemComponent } from './sem/sem.component';
import { ExamResultsComponent } from './exam-results/exam-results.component';

const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    children: [
      {
        path: '',
        component: DashboardComponent,
        canActivate: [AuthGuard],
        data: { roles: [Roles.ADMIN, Roles.DIRECTOR, Roles.TEACHER, Roles.SRO] },
      },
      {
        path: 'exam-results/:examId',
        component: ExamResultsComponent,
        canActivate: [AuthGuard],
        data: { roles: [Roles.ADMIN, Roles.SRO] },
      },
      {
        path: 'employee',
        component: EmployeeComponent,
        canActivate: [AuthGuard],
        data: { roles: [Roles.ADMIN, Roles.DIRECTOR] },
      },
      {
        path: 'class',
        component: ClassComponent,
        canActivate: [AuthGuard],
        data: { roles: [Roles.ADMIN, Roles.SRO] },
      },
      {
        path: 'student',
        component: StudentComponent,
        canActivate: [AuthGuard],
        data: { roles: [Roles.ADMIN, Roles.SRO] },
      },
      {
        path: 'class/:classId',
        component: StudentComponent,
        canActivate: [AuthGuard],
        data: { roles: [Roles.ADMIN, Roles.SRO] },
      },
      {
        path: 'student/marks/:studentId',
        component: MarkComponent,
        canActivate: [AuthGuard],
        data: { roles: [Roles.ADMIN, Roles.SRO] },
      },
      {
        path: 'class/:classId/marks/:studentId',
        component: MarkComponent,
        canActivate: [AuthGuard],
        data: { roles: [Roles.ADMIN, Roles.SRO] },
      },
      {
        path: 'level',
        component: LevelComponent,
        canActivate: [AuthGuard],
        data: { roles: [Roles.ADMIN, Roles.TEACHER] },
      },
      {
        path: 'profile',
        component: ProfileComponent,
        canActivate: [AuthGuard],
        data: { roles: [Roles.ADMIN, Roles.DIRECTOR, Roles.TEACHER, Roles.SRO] },
      },
      {
        path: 'sem',
        component: SemComponent,
        canActivate: [AuthGuard],
        data: { roles: [Roles.ADMIN, Roles.DIRECTOR] },
      },
      {
        path: 'subject',
        loadChildren: () => import('./subject/subject.module')
          .then(m => m.SubjectModule),
        canActivate: [AuthGuard],
        data: { roles: [Roles.ADMIN, Roles.DIRECTOR, Roles.TEACHER] },
      },
      {
        path: 'exam',
        loadChildren: () => import('./examination/examination.module')
          .then(m => m.ExaminationModule),
        canActivate: [AuthGuard],
        data: { roles: [Roles.ADMIN, Roles.SRO] },
      },
      {
        path: 'practice',
        loadChildren: () => import('./practice/practice.module')
          .then(m => m.PracticeModule),
        canActivate: [AuthGuard],
        data: { roles: ['EXAMPLE'] },
      },
      {
        path: 'authorize',
        loadChildren: () => import('./authorize/authorize.module')
          .then(m => m.AuthorizeModule),
        canActivate: [AuthGuard],
        data: { roles: [Roles.ADMIN, Roles.DIRECTOR, Roles.TEACHER, Roles.SRO] },
      },
    ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HomeRoutingModule { }