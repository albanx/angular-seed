import {NgModule}     from '@angular/core';
import {RouterModule} from '@angular/router';
import {HomeComponent} from './home';
import {AboutComponent} from './about';

@NgModule({
    imports: [
        RouterModule.forRoot([
            {path: '', component: HomeComponent},
            {path: 'home', component: HomeComponent},
            {path: 'search', loadChildren: 'app/search/search.module#SearchModule'},
            {path: 'about', component: AboutComponent},
            {path: '**', redirectTo: ''}
        ])
    ],
    exports: [
        RouterModule
    ]
})
export class AppRoutingModule {
}
