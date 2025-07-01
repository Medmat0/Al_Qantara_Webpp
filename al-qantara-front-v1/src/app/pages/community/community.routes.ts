import {Routes} from '@angular/router';
import { CommunityHomeComponent } from './components/community-home/community-home.component';
import { CommunityResearchComponent } from './components/community-research/community-research.component';
import { CommunityHubComponent } from './components/community-hub/community-hub.component';
import { CommunityPostDescriptionComponent } from './components/community-post-description/community-post-description.component';
import {CommunityPostCreationComponent} from './components/community-post-creation/community-post-creation.component';
import {CommunityMembersComponent} from './components/community-members/community-members.component';
import {ModeratorGuard} from '../../member/guards/moderator.guard';


export default [
    {path: '', component:CommunityHomeComponent,},
    {path: 'research', component: CommunityResearchComponent},
    {path: ':communityId', component: CommunityHubComponent},
    {path: ':communityId/members', component: CommunityMembersComponent, canActivate:[ModeratorGuard]},
    {path: ':communityId/posts/create', component:CommunityPostCreationComponent},
    {path: ':communityId/posts/:postId', component: CommunityPostDescriptionComponent},


]as Routes;
