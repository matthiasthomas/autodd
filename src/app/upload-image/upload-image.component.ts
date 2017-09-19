import { Component, OnInit } from '@angular/core';
import { UploadImageService } from '../upload-image.service';

@Component({
  selector: 'app-upload-image',
  templateUrl: './upload-image.component.html',
  styleUrls: ['./upload-image.component.css']
})
export class UploadImageComponent implements OnInit {

  reader: FileReader = new FileReader();
  form_data: FormData = new FormData();
  img_src: string;
  description;
  file;
  progress;

  constructor(private uploadImageService: UploadImageService) { }

  ngOnInit() {
    this.uploadImageService.progressEvent.subscribe(data => {
      this.progress = data;
    });
  }

  upload() {
    this.form_data.append('image', this.file);
    this.uploadImageService.post(this.form_data)
      .subscribe(result => {
        console.log(result);
        this.progress = "";
      });
  }

  onChange(event) {
    var files = event.target.files || event.srcElement.files;
    if (files && files[0]) {
      this.file = files[0];
    }
  }
}
