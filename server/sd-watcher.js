const { spawn } = require('child_process');
const path = require('path');

const in_use = [];
let timeout = null;

function check(callback) {
  const lsblk = spawn('lsblk', ['--scsi']);
  let result = "";
  lsblk.stdout.on('data', data => {
    result += (data.toString());
  });
  lsblk.stderr.on('data', (data) => {
    result += (data.toString());
  });
  lsblk.on('close', (code) => {
    return callback(result);
  });
};

function dd_the_card(name) {
  console.log('Start dd on card ' + name);
  in_use.push(name);
  // Send drive to webapp
  global.io.emit('message', {
    label: 'new-card',
    name: name
  });
  const drive = '/dev/' + name;
  const image = path.join(process.cwd(), 'image.img');
  // dd the image
  const dd = spawn('dd', ['if=' + image, 'of=' + drive, 'bs=1M', 'count=3200', 'status=progress']);
  //umount the card
  dd.stdout.on('data', data => {
    // console.log('stdout: ' + data.toString());
  });
  dd.stderr.on('data', (data) => {
    console.log(name +' : '+ data.toString());
  });
  dd.on('close', (code) => {
    // console.log('close: ' + result);
  });
  return;
}

function startWatch() {
  timeout = setTimeout(() => {
    stopWatch();
    check(result => {
      result = result.split('\n');
      for(let r of result){
        r = r.split(' ');
        if(r[0] !== '' &&
            r[0] !== 'NAME' &&
            r[0] !== 'sda' &&
            r[0] !== 'sr0' &&
            in_use.indexOf(r[0]) < 0) {
              dd_the_card(r[0]);
        }
      }
      startWatch();
    });
  }, 2000);
}

function stopWatch(){
  clearTimeout(timeout);
}

global.io.on('connection', function (socket) {
  socket.emit('news', { hello: 'world' });
  socket.on('my other event', function (data) {
    console.log(data);
  });
});

module.exports = {
    in_use: in_use,
    init: function(){
        startWatch();
    }
}