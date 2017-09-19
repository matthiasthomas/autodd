import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { IoService } from './io.service';
import { AppComponent } from './app.component';
import { UploadImageComponent } from './upload-image/upload-image.component';
import { UploadImageService } from './upload-image.service';
import { HttpModule } from '@angular/http';
import { ProgressHttpModule } from "angular-progress-http";

@NgModule({
  declarations: [
    AppComponent,
    UploadImageComponent
  ],
  imports: [
    BrowserModule,
    HttpModule,
    ProgressHttpModule
  ],
  providers: [
    IoService,
    UploadImageService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
