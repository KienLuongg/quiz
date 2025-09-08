import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { HomeRoutingModule } from './home-routing.module';


import { HomeComponent } from './home.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { StudentComponent } from './student/student.component';
import { ClassComponent } from './class/class.component';
import { EmployeeComponent } from './employee/employee.component';
import { ProfileComponent } from './profile/profile.component';
import { FormsModule } from '@angular/forms';
import { SubjectModule } from './subject/subject.module';
import { ExaminationModule } from './examination/examination.module';
import { LevelComponent } from './level/level.component';

import { NgApexchartsModule } from "ng-apexcharts";
import { NgScrollbarModule } from 'ngx-scrollbar';
import { NgxPaginationModule } from 'ngx-pagination';
import { SharedModule } from '../../shared/shared.module';
import { MarkComponent } from './mark/mark.component';
import { SemComponent } from './sem/sem.component';
import { ExamResultsComponent } from './exam-results/exam-results.component';

@NgModule({
  declarations: [
    HomeComponent,
    DashboardComponent,
    StudentComponent,
    ClassComponent,
    EmployeeComponent,
    ProfileComponent,
    LevelComponent,
    MarkComponent,
    SemComponent,
    ExamResultsComponent
  ],
  imports: [
    CommonModule,
    HomeRoutingModule,
    SubjectModule,
    ExaminationModule,
    SharedModule,
    FormsModule,
    NgApexchartsModule,
    NgScrollbarModule,
    NgxPaginationModule
  ],
  providers: [DatePipe]
})
export class HomeModule { }