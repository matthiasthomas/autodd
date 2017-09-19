const { spawn } = require('child_process');
const path = require('path');

const cards = [];
let timeout = null;

function updateStatus(name, status) {
  if(status.replace(' ', '') !== '')
    for(let c of cards) {
      if(c.name === name) {
        c.status = status;
        break;
      }
    }
}

setInterval(() => {
  global.io.emit('message', {
    label: 'cards',
    cards: cards
  });
}, 1000);

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

function cardInUse(name){
  for(let c of cards) {
    if(c.name === name) return true;
  }
  return false;
}

function dd_the_card(name) {
  console.log('Start dd on card ' + name);
  cards.push({
    name: name,
    status: 'Started!'
  });
  const drive = '/dev/' + name;
  const image = path.join(process.cwd(), 'image.img');
  // dd the image
  const dd = spawn('dd', ['if=' + image, 'of=' + drive, 'bs=1M', 'count=3200', 'status=progress']);
  dd.stderr.on('data', (data) => {
    updateStatus(name, data.toString());
  });
  dd.on('close', (code) => {
    updateStatus(name, 'Done!');
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
            !cardInUse(r[0])) {
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
  console.log('New connection from ' + socket.id);
});

module.exports = {
    cards: cards,
    init: function(){
        startWatch();
    }
}