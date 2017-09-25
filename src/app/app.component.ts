import { Component } from '@angular/core';
import { IoService } from './io.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'Auto DD';

  color = 'primary';
  mode = 'determinate';
  messages = [];
  connection;
  cards = [];

  constructor(private ioService: IoService) {}

  sendMessage(message){
    this.ioService.sendMessage(message);
  }

  // eject(name) {
  //   this.sendMessage({
  //     label: 'eject',
  //     name: name
  //   });
  // }

  // ejectAll() {
  //   this.sendMessage({
  //     label: 'eject_all'
  //   });
  // }

  // allDone() {
  //   for(let c in this.cards) {
  //     if(!c['done']) return false;
  //   }
  //   return true;
  // }

  ngOnInit() {
    this.connection = this.ioService.getMessages().subscribe(message => {
      switch(message['label']){
        case "cards":
          this.cards = message['cards'];

          break;
        default:
          break;
      }
    });
  }
  
  ngOnDestroy() {
    this.connection.unsubscribe();
  }
}