import {Routes} from '@angular/router';
import { CommunityHomeComponent } from './components/community-home/community-home.component';
import { CommunityResearchComponent } from './components/community-research/community-research.component';
import { CommunityHubComponent } from './components/community-hub/community-hub.component';
import { CommunityPostDescriptionComponent } from './components/community-post-description/community-post-description.component';


export default [
    {path: '', component:CommunityHomeComponent,},
    {path: 'research', component: CommunityResearchComponent,},
    {path: ':communityId', component: CommunityHubComponent},
    {path: ':communityId/posts/:postId', component: CommunityPostDescriptionComponent},
    
]as Routes; 