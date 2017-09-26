const express = require('express');
const app = express();
const server = require('http').Server(app);
global.io = require('socket.io')(server);
const { spawn } = require('child_process');
const path = require('path');
const sd_watcher = require(path.join(__dirname, 'server/sd-watcher'));
const api = require(path.join(process.cwd(), 'server/api'))(app);

// Point static path to dist
app.use(express.static(path.join(__dirname, 'dist')));
global.root_path = __dirname;

sd_watcher.init(err => {
  if(err) {
    console.log('Error when initializing sd_watcher: ' + err);
    process.exit(1);
  }
});

const port = 80;

server.listen(port, function () {
  console.log('App listening on port ' + port + '!');
});