import {enableProdMode} from '@angular/core';
import {platformBrowser} from '@angular/platform-browser';
import {environment} from './environments/environment';
import {AppModuleNgFactory} from '../compiled/src/app/app.module.ngfactory';
if (environment.production) {
    enableProdMode();
}
platformBrowser().bootstrapModuleFactory(AppModuleNgFactory);
