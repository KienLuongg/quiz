import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DetailComponent } from './detail/detail.component';
import { ListComponent } from './list/list.component';
import { FormsModule } from '@angular/forms';
import { AuthorizeComponent } from './authorize.component';
import { AuthorizeRoutingModule } from './authorize-routing.module';



@NgModule({
  declarations: [
    AuthorizeComponent,
    ListComponent,
    DetailComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    AuthorizeRoutingModule
  ]
})
export class AuthorizeModule { }
