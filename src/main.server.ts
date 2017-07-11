import 'zone.js/dist/zone-node';
import 'reflect-metadata';
import 'rxjs/Rx';
import {enableProdMode} from '@angular/core'
import { platformServer, renderModuleFactory } from '@angular/platform-server';
import * as express from 'express';
import {ngExpressEngine} from './express-engine'
import {AppServerModule} from "./app/app.server.module";

enableProdMode();

const app = express();
const PORT = 8081;


app.engine('html', ngExpressEngine({
    bootstrap: AppServerModule
}));

app.set('views', 'src');

app.set('view engine', 'html');

app.use('/', express.static('dist', {index: false}));

app.get('/', (req, res) => {
    res.render('index', {req});
});

app.get('*', (req, res) => {
    res.render('index', {req});
});

app.listen(PORT, () => {
    console.log('listening port ' + PORT + '...');
});
