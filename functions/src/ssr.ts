import 'zone.js/dist/zone-node';
import {enableProdMode} from '@angular/core';
import {ngExpressEngine} from '@nguniversal/express-engine';
import {REQUEST, RESPONSE} from '@nguniversal/express-engine/tokens';
import {json, urlencoded} from 'body-parser';
import * as compression from 'compression';
import * as domino from 'domino';
import * as express from 'express';
import * as cors from 'cors';
import * as functions from 'firebase-functions';

const win = domino.createWindow('');

// Polyfills required for Firebase
global['WebSocket'] = require('ws');
global['XMLHttpRequest'] = require('xhr2');
global['window'] = win;
global['document'] = win.document;
global['DOMTokenList'] = win['DOMTokenList'];

/**
 * hack for protobufjs
 * https://github.com/protobufjs/protobuf.js/blob/master/src/util/minimal.js
 */
global['window']['process'] = {
  versions: {
    node: true
  }
};

enableProdMode();

const app = express();
app.use(compression());
app.use(cors());
app.use(json());
app.use(urlencoded({extended: true}));

const DIST_FOLDER = './dist/public/shop';
const {AppServerModuleNgFactory} = require('./../dist/server/main');

app.engine('html', (_, options, callback) =>
  ngExpressEngine({
    bootstrap: AppServerModuleNgFactory,
    providers: [
      {
        provide: REQUEST,
        useValue: options.req
      },
      {
        provide: RESPONSE,
        useValue: options.req.res
      }
    ]
  })(_, options, callback)
);

app.use(cors({origin: true}));
app.set('view engine', 'html');
app.set('views', DIST_FOLDER);

app.get('*.*', express.static(DIST_FOLDER, {maxAge: '1y'}));
app.get('*', (req, res) => {
  res.render('index', {req});
});

export const ssr = functions.https.onRequest(app);
