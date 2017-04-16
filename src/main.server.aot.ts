import 'zone.js/dist/zone-node';
import 'reflect-metadata';
import 'rxjs/Rx';
import {enableProdMode} from '@angular/core'
import * as express from 'express';
import {ngExpressEngine} from './express-engine'
import {AppServerModuleNgFactory} from "../compiled/src/app/app.server.module.ngfactory";

enableProdMode();

const app = express();


app.engine('html', ngExpressEngine({
    bootstrap: AppServerModuleNgFactory,
    aot: true
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
