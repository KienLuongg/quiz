import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ListComponent } from './list/list.component';
import { DetailComponent } from './detail/detail.component';
import { AddFormComponent } from './add-form/add-form.component';
import { UpdateFormComponent } from './update-form/update-form.component';
import { PracticeComponent } from './practice.component';
import { AddStudentComponent } from './add-student/add-student.component';
import { PraticeRoutingModule } from './practice-routing.module';
import { FormsModule } from '@angular/forms';



@NgModule({
  declarations: [
    PracticeComponent,
    ListComponent,
    DetailComponent,
    AddFormComponent,
    UpdateFormComponent,
    AddStudentComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    PraticeRoutingModule
  ]
})
export class PracticeModule { }
