import { Routes } from '@angular/router';
import {ArticlesComponent} from './components/articles/articles.component';
import {ArticledescriptionComponent} from './components/articledescription/articledescription.component';


export default [
  {path: '', component:ArticlesComponent},
  {path: ':id', component:ArticledescriptionComponent},
] as Routes;
