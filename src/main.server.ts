import 'zone.js/dist/zone-node';
import 'reflect-metadata';
import 'rxjs/Rx';
import {enableProdMode} from '@angular/core'
// import {AppServerModuleNgFactory} from '../src-server/src/app/app.server.module.ngfactory';
import * as express from 'express';
import {ngExpressEngine} from './express-engine'
import {AppServerModule} from "./app/app.server.module";

enableProdMode();

const app = express();


app.engine('html', ngExpressEngine({
    bootstrap: AppServerModule
}));
app.set('view engine', 'html');
app.set('views', 'dist/server');

app.get('/', (req, res) => {
    res.render('index', {req});
});

app.get('*', (req, res) => {
    res.render('index', {req, res});
});

app.listen(8000, () => {
    console.log('listening port 8000...')
});
