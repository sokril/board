/*
 * Copyright (c) 2016 VMware, Inc. All Rights Reserved.
 * This software is released under MIT license.
 * The full license information can be found in LICENSE in the root directory of this project.
 */
import { ModuleWithProviders } from '@angular/core/src/metadata/ng_module';
import { Routes, RouterModule } from '@angular/router';

import { SignInComponent } from './account/sign-in/sign-in.component';
import { SignUpComponent } from './account/sign-up/sign-up.component';
import { MainContentComponent } from './main-content/main-content.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { NodeComponent } from './node/node.component';
import { ProjectComponent } from './project/project.component';
import { MemberComponent } from './project/member/member.component';
import { ImageComponent } from './image/image.component';
import { ServiceComponent } from './service/service.component';
import { ProfileComponent } from './profile/profile.component';

export const ROUTES: Routes = [
    { path: '', redirectTo: 'sign-in', pathMatch: 'full' },
    { path: 'sign-in', component: SignInComponent },
    { path: 'sign-up', component: SignUpComponent },
    { path: '', component: MainContentComponent, children: [
        { path: 'dashboard', component: DashboardComponent },
        { path: 'nodes', component: NodeComponent },
        { path: 'projects',  
            children: [
                { path: '', component: ProjectComponent },
                { path: 'members', component: MemberComponent }
            ] 
        },
        { path: 'images', component: ImageComponent },
        { path: 'services', component: ServiceComponent },
        { path: 'profiles', component: ProfileComponent }
    ]}
];

export const ROUTING: ModuleWithProviders = RouterModule.forRoot(ROUTES);