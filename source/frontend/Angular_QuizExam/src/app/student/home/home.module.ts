import { NgModule } from '@angular/core';
import { HeaderComponent } from './common/header/header.component';
import { FooterComponent } from './common/footer/footer.component';
import { HomeComponent } from './home.component';
import { HomeRoutingModule } from './home-routing.module';
import { CommonModule, DatePipe, NgClass, NgFor, NgForOf } from '@angular/common';
import { MarkComponent } from './mark/mark.component';
import { FormsModule } from '@angular/forms';
import { ProfileComponent } from './profile/profile.component';
import { SharedModule } from '../../shared/shared.module';


@NgModule({
  declarations: [
    HomeComponent,
    HeaderComponent,
    FooterComponent,
    MarkComponent,
    ProfileComponent
  ],
  imports: [
    HomeRoutingModule,
    NgClass,
    CommonModule,
    NgForOf,
    FormsModule,
    SharedModule
  ],
  providers: [DatePipe],
  bootstrap: []
})
export class HomeModule { }