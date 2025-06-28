import {Routes} from '@angular/router';
import { CommunityHomeComponent } from './components/community-home/community-home.component';
import { CommunityResearchComponent } from './components/community-research/community-research.component';
import { CommunityHubComponent } from './components/community-hub/community-hub.component';


export default [
    {path: '', component:CommunityHomeComponent,},
    {path: 'research', component: CommunityResearchComponent,},
    {path: ':communityId', component: CommunityHubComponent}
    
]as Routes; 