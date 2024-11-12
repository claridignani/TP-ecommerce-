import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CategoriesComponent } from './categories.component';
import { LitsCategoriesComponent } from './lits-categories/lits-categories.component';

//localhost:4200/categories/list
const routes: Routes = [
  {
    path: '',
    component: CategoriesComponent,
    children: [
      {
        path: 'list',
        component: LitsCategoriesComponent,
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CategoriesRoutingModule { }
