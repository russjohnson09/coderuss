import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
// import {APP_BASE_HREF} from '@angular/common';


import { AppComponent } from './app.component';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule
  ],
  providers: [
    // {provide: APP_BASE_HREF, useValue: '/my-app'}
    ],
  bootstrap: [AppComponent]
})
export class AppModule { }