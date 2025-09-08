import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { StudentComponent } from './student.component';

const routes: Routes = [
    {
    path: '', 
    component: StudentComponent,
    children: [
      {
        path: 'login',
        component: LoginComponent,
      },
      {
        path: '',
        loadChildren: () => import('./home/home.module')
          .then(m => m.HomeModule),
      }
    ]
  },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class StudentRoutingModule { }
