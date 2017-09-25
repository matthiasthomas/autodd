const { spawn } = require('child_process');
const path = require('path');
const custom_fs = require('./custom-fs');

const cards = [];
const processes = {};
let timeout = null;

function updateStatus(name, status, percentage) {
  if(status.replace(' ', '') !== '')
    for(let c of cards) {
      if(c.name === name) {
        c.status = status;
        c.percentage = percentage;
        break;
      }
    }
}

function setDone(name) {
  for(let c of cards) {
    if(c.name === name) {
      c.done = true;
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

function getPercentage(size) {
  const image_info = custom_fs.readImageInfoFile();
  if(image_info) {
    return Math.round(size / image_info.size * 100); 
  }
  return 0;
}

function extractSize(data) {
  const regex_gb = /\((.*) GB.*\)/g;
  const regex_mb = /\((.*) MB.*\)/g;

  let m, match_gb, match_mb;
  // check for gb
  while ((m = regex_gb.exec(data)) !== null) {
      if (m.index === regex_gb.lastIndex) {
        regex_gb.lastIndex++;
      }
      if(m && m.length > 1) match_gb = m[1];
  }
  // if no gb, check for mb
  if(match_gb) {
    return (parseFloat(match_gb) * Math.pow(10, 9));
  } else {
    while ((m = regex_mb.exec(data)) !== null) {
      if (m.index === regex_mb.lastIndex) {
        regex_mb.lastIndex++;
      }
      if(m && m.length > 1) match_mb = m[1];
      return (parseFloat(match_mb) * Math.pow(10, 6));
    }
  }
  return 0;
}

function dd_the_card(name) {
  console.log('Start dd on card ' + name);
  let card = {
    name: name,
    status: 'Started!',
    percentage: 0,
    done: false
  };
  cards.push(card);
  const drive = '/dev/' + name;
  const image = path.join(process.cwd(), 'image.img');
  // dd the image
  processes[card.name] = spawn('dd', ['if=' + image, 'of=' + drive, 'bs=1M', 'count=3200', 'status=progress']);
  processes[card.name].stderr.on('data', (data) => {
    const size = extractSize(data.toString());
    updateStatus(name, data.toString(), getPercentage(size));
  });
  processes[card.name].on('close', (code) => {
    setDone(name);
    updateStatus(name, 'Done!', 100);
  });
  return;
}

function eject(name) {
  let index = -1;
  cards.forEach((c, i) => {
    if(c.name === name) index = i;
  });
  if (index > -1) {
    processes[name].stdin.pause();
    processes[name].kill();
    delete processes[name];
    cards.splice(index, 1);
  }
}

// function ejectAll(){
//   for(let card of cards) {
//     card.process.stdin.pause();
//     card.process.kill();
//   }
//   cards = [];
// }

function checkForDisconnectedCards(connected_cards) {
  // Check if device disconnected
  let cards_to_remove = [];
  for(let c of cards) {
    if(!connected_cards[c.name]) cards_to_remove.push(c.name);
  }
  // remove cards
  for(let c of cards_to_remove){
    eject(c);
  }
}

function startWatch() {
  timeout = setTimeout(() => {
    stopWatch();
    check(result => {
      let connected_cards = {};
      result = result.split('\n');
      for(let r of result) {
        r = r.split(' ');
        // Check if new device connected
        connected_cards[r[0]] = true;
        if(r[0] !== '' &&
            r[0] !== 'NAME' &&
            r[0] !== 'sda' &&
            r[0] !== 'sr0' &&
            !cardInUse(r[0])) {
              dd_the_card(r[0]);
        }
      }
      checkForDisconnectedCards(connected_cards);
      // Start watching again
      startWatch();
    });
  }, 2000);
}

function stopWatch(){
  clearTimeout(timeout);
}

global.io.on('connection', function (socket) {
  console.log('New connection from ' + socket.id);
  socket.emit('message', {
    label: "image_info",
    data: custom_fs.readImageInfoFile()
  })
});

module.exports = {
    cards: cards,
    init: function(){
        startWatch();
    }
}