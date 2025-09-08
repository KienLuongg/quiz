import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ListComponent } from './list/list.component';
import { ChapterComponent } from './chapter/chapter.component';
import { FormsModule } from '@angular/forms';
import { SubjectRoutingModule } from './subject-routing.module';
import { SubjectComponent } from './subject.component';
import { QuestionListComponent } from './question-list/question-list.component';
import { QuestionFormComponent } from './question-form/question-form.component';
import { QuestionUpdateComponent } from './question-update/question-update.component';
import { SharedModule } from '../../../shared/shared.module';


@NgModule({
  declarations: [
    SubjectComponent,
    ListComponent,
    ChapterComponent,
    QuestionListComponent,
    QuestionFormComponent,
    QuestionUpdateComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    SharedModule,
    SubjectRoutingModule
  ]
})
export class SubjectModule { }
