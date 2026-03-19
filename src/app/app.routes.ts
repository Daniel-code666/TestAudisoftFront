import { Routes } from '@angular/router';
import { MainLayoutComponent } from './layout/main-layout/main-layout';

export const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      {
        path: '',
        redirectTo: 'estudiantes',
        pathMatch: 'full'
      },
      {
        path: 'estudiantes',
        loadComponent: () =>
          import('./pages/estudiantes/estudiantes').then(
            m => m.EstudiantesComponent
          )
      },
      {
        path: 'profesores',
        loadComponent: () =>
          import('./pages/profesores/profesores').then(
            m => m.ProfesoresComponent
          )
      },
      {
        path: 'notas',
        loadComponent: () =>
          import('./pages/notas/notas').then(
            m => m.NotasComponent
          )
      }
    ]
  },
  {
    path: '**',
    redirectTo: ''
  }
];
