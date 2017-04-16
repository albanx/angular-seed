import {NgModule} from '@angular/core';
import {ServerModule} from '@angular/platform-server';
import {BrowserModule} from "@angular/platform-browser";
import {AppModule} from './app.module';
import {AppComponent} from './app.component';

@NgModule({
    imports: [
        BrowserModule.withServerTransition({appId: 'appIdSample'}),
        ServerModule,
        AppModule
    ],
    bootstrap: [AppComponent]
})
export class AppServerModule {
}
