import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {SearchComponent} from "./search.component";
import {SearchRoutingModule} from "./search.routing.module";
import {SearchFormComponent} from "./search-form/search-form.component";

@NgModule({
    imports: [
        CommonModule,
        SearchRoutingModule
    ],
    declarations: [
        SearchComponent,
        SearchFormComponent
    ]
})
export class SearchModule {
}
