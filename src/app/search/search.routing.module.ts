import {NgModule}     from '@angular/core';
import {RouterModule} from '@angular/router';
import {SearchFormComponent} from "./search-form/search-form.component";
import {SearchComponent} from "./search.component";


@NgModule({
    imports: [
        RouterModule.forChild([
            {
                path: '',
                component: SearchFormComponent,
                // children: [
                //     {path: '', component: SearchFormComponent}
                // ]
            }
        ])
    ],
    exports: [
        RouterModule
    ]
})
export class SearchRoutingModule {
}
