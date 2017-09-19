import { Injectable, Inject } from '@angular/core';
import { ProgressHttp } from "angular-progress-http";
import { Observable } from "rxjs/Observable";
import "rxjs/add/operator/map";
import { EventEmitter } from '@angular/core';

@Injectable()
export class UploadImageService {

  constructor(@Inject(ProgressHttp) private http: ProgressHttp) { }

  static ENDPOINT: string = '/api/image';
  progressEvent: EventEmitter<any> = new EventEmitter();

  post(form_data): Observable<any> {
    return this.http
      .withUploadProgressListener(progress => { this.progressEvent.emit(`Uploading ${progress.percentage}%`); })
      .post(UploadImageService.ENDPOINT, form_data)
      .map(result => result.json());
  }
}
