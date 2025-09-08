import { NgModule } from '@angular/core';
import { StudentRoutingModule } from './student-routing.module';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ToastrModule } from 'ngx-toastr';
import { StudentComponent } from './student.component';
import { LoginComponent } from './login/login.component';
import { CommonModule } from '@angular/common';
import { AuthGuard } from './service/authguard.service';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { ErrorInterceptor } from '../shared/service/error.interceptor';

@NgModule({
  declarations: [
    StudentComponent,
    LoginComponent
  ],
  imports: [
    CommonModule,
    ToastrModule,
    StudentRoutingModule,
    FormsModule,
    ReactiveFormsModule
  ],
  providers: [
    NgModule,
    AuthGuard,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ErrorInterceptor,
      multi: true
    }
  ],
  bootstrap: []
})
export class StudentModule { }