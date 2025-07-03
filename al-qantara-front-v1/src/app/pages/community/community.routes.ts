import {Routes} from '@angular/router';
import { CommunityHomeComponent } from './components/community-home/community-home.component';
import { CommunityResearchComponent } from './components/community-research/community-research.component';
import { CommunityHubComponent } from './components/community-hub/community-hub.component';
import { CommunityPostDescriptionComponent } from './components/community-post-description/community-post-description.component';
import {CommunityPostCreationComponent} from './components/community-post-creation/community-post-creation.component';
import {CommunityMembersComponent} from './components/community-members/community-members.component';
import {ModeratorGuard} from '../../member/guards/moderator.guard';
import {CommunityPostResearchComponent} from './components/community-post-research/community-post-research.component';
import {CommunityHubSettingsComponent} from './components/community-hub-settings/community-hub-settings.component';
import {CommunityCreationComponent} from './components/community-creation/community-creation.component';


export default [
    {path: '', component:CommunityHomeComponent,},
    {path: 'research', component: CommunityResearchComponent},
    {path: 'create', component: CommunityCreationComponent},
    {path: 'posts/research', component: CommunityPostResearchComponent},
    {path: ':communityId/settings', component: CommunityHubSettingsComponent, canActivate:[ModeratorGuard]},
    {path: ':communityId', component: CommunityHubComponent},
    {path: ':communityId/members', component: CommunityMembersComponent, canActivate:[ModeratorGuard]},
    {path: ':communityId/posts/create', component:CommunityPostCreationComponent},
    {path: ':communityId/posts/:postId', component: CommunityPostDescriptionComponent},


]as Routes;
