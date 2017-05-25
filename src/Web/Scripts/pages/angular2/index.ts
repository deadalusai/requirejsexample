console.log('Loading Angular2');

import 'zone.js';
import 'reflect-metadata';

import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app.module';

console.log('Loading app module');

platformBrowserDynamic().bootstrapModule(AppModule);

console.log('Ready to go');