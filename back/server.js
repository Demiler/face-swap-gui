const WebSocket = require('ws');
const chokidar = require('chokidar');
const fs = require('fs');
const isImage = require('is-image');
const { log } = require('./logger.js');

//==========================CONSTS==========================//
//const dir = "/home/demiler/Pictures"
const dir = "/home/demiler/contests/sem3/chmi/solveSLE/report/assets";
const port = 8081
log.setLog('client', true);
log.setLog('db', true);
//==========================DATA BASE==========================//
let dataBase = new Map();
global.db = dataBase;
dataBase.addImg = path => {
  if (dataBase.has(path)) {
    log.do('db', 'ignored existing file' + path);
    return;
  }

  if (path.endsWith(".gif") || !isImage(path)) {
    log.do('db', 'ignored not image file' + path);
    return;
  }
  log.do('db', 'adding "' + path + '"');

  dataBase.set(path, undefined);
  fs.readFile(path, 'base64', (err, img) => {
    if (err)
      log.error(err);
    dataBase.set(path, img);
  });
};

dataBase.change = path => {
  let file = dataBase.get(path)
  if (file === undefined)
    log.err(path + "not found to be changed");
  fs.readFile(path, 'base64', (err, img) => {
    if (err)
      log.error(err);
    file = img;
  });
}

//==========================INIT==========================//
log.me('Initializing');

log.me('Readding default dir ' + dir);
filenames = fs.readdirSync(dir);
filenames = filenames.filter(name =>
  !name.endsWith(".gif") && isImage(dir +'/'+ name)
);
log.me('Files names filtered');

filenames.forEach(name => dataBase.addImg(dir + '/' + name));
log.me('Data base initialized');

log.me('Starting watcher');
const watcher = chokidar.watch(dir, {
  ignored: /^\./,
  persistent: true,
  depth: 0
});
watcher.on('add', dataBase.addImg);
watcher.on('change', dataBase.change);
watcher.on('unlink', dataBase.delete);
watcher.on('error', path => log.error('error with ' + path));

log.me('Starting server at port ' + port);
const server = new WebSocket.Server({ port });

server.on('connection', ws => {
  log.do('client', 'new client');
  ws.say = (type, data) => ws.send(JSON.stringify({ type, data }));

  ws.on('message', (data) => {
    log.do('client', 'message from client');
    data = JSON.parse(data);
  });
});

//==============FUNCS================//
const sendAllFiles = ws => {
  ws.say("rebase", Array.from(dataBase.entries()));
}

const sendFile = (ws, path) => {
  let data = dataBase.get(path);
  ws.say("new-file", {path, data});
}

const sendUnlink = (ws, path) => {
  ws.say("unlink", {path, data});
}

const sendChange = (ws, path) => {
  let data = dataBase.get(path);
  ws.say("change", {path, data});
}
