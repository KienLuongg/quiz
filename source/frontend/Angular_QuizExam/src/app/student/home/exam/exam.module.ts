import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ListComponent } from './list/list.component';
import { ResultComponent } from './result/result.component';
import { DetailComponent } from './detail/detail.component';
import { ExamComponent } from './exam.component';
import { FormsModule } from '@angular/forms';
import { ExamRoutingModule } from './exam-routing.module';
import { SharedModule } from '../../../shared/shared.module';



@NgModule({
  declarations: [
    ExamComponent,
    ListComponent,
    ResultComponent,
    DetailComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ExamRoutingModule,
    SharedModule
  ]
})
export class ExamModule { }
