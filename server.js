const express = require('express');
const app = express();
const server = require('http').Server(app);
global.io = require('socket.io')(server);
const { spawn } = require('child_process');
const path = require('path');
const sd_watcher = require(path.join(process.cwd(), 'server/sd-watcher'));

// Point static path to dist
app.use(express.static(path.join(__dirname, 'dist')));

sd_watcher.init();

const port = 8080;

server.listen(port, function () {
  console.log('App listening on port ' + port + '!');
});