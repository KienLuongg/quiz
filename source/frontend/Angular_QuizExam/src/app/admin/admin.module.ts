import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginComponent } from './login/login.component';
import { AdminRoutingModule } from './admin-routing.module';
import { ToastrModule } from 'ngx-toastr';
import { FormsModule} from '@angular/forms';
import { AdminComponent } from './admin.component';
import { ReactiveFormsModule } from '@angular/forms'; 
import { AuthGuard } from './service/authguard.service';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { ErrorInterceptor } from '../shared/service/error.interceptor';

@NgModule({
  declarations: [
    LoginComponent,
    AdminComponent
  ],
  imports: [
    CommonModule,
    AdminRoutingModule,
    FormsModule,
    ToastrModule,
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
})
export class AdminModule { }