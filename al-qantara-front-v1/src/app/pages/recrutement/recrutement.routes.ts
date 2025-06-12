import {Routes} from '@angular/router';
import { OffreDescriptionComponent } from './components/offre-description/offre-description.component';
import { RecrutementHomeComponent } from './components/recrutement-home/recrutement-home.component';

export default [
    {path:'',component:RecrutementHomeComponent},
    {path:':id',component:OffreDescriptionComponent}
] as Routes;