const WebSocket = require('ws');
const chokidar = require('chokidar');
const fs = require('fs');
const serveStatic = require('serve-static');
const http = require('http');
const finalhandler = require('finalhandler')
const { log } = require('./logger.js');
const { File } = require('./file.js');
const { dataBase } = require('./dataBase.js');
const cfg = require('../config.json');
const { validateImage } = require('./validateImage.js')

//==========================CONSTS==========================//
const SAVE_PERIOD = 1000 * 60 * 5; //5 min save period
log.setLog('client', true);
//==========================HTTPSR==========================//
const serve = serveStatic('../build', { index: ['index.html'] })

const httpServ = http.createServer(function onRequest (req, res) {
  serve(req, res, finalhandler(req, res))
})
httpServ.listen(process.env.PORT || cfg.port);
//==========================INIT==========================//
log.me('Initializing');
log.me('Readding config ' + cfg.configFile);
let config = JSON.parse(fs.readFileSync(cfg.configFile, 'utf8'));

log.me('Starting watcher');
const watcher = chokidar.watch(cfg.dir, {
  ignored: /^\./,
  persistent: true,
  depth: 0
});

watcher.on('add', dataBase.addImg);
watcher.on('change', dataBase.change);
watcher.on('unlink', dataBase.delImg);
watcher.on('ready', dataBase.init);
watcher.on('error', path => log.error('error with ' + path));

log.me('Starting server at port ' + cfg.port);
const server = new WebSocket.Server({ server: httpServ });

const saveInterval = setInterval(() => {
  dataBase.save();
}, SAVE_PERIOD);

//==============SERVER================//
server.heAlive = () =>
  server.onlyClient != undefined && server.onlyClient.readyState === WebSocket.OPEN;

server.on('connection', ws => {
  log.do('client', 'new client');
  if (server.heAlive())
    server.onlyClient.send('kill');
  server.onlyClient = ws;

  ws._send = ws.send;
  ws.send = (type, data) => {
    if (server.heAlive())
      ws._send(JSON.stringify({ type, data }));
    else
      log.error('client is not accessible');
  }

  dataBase.sendFile   = (file) => ws.send('new-file', file);
  dataBase.sendChange = (file) => ws.send('change', file);
  dataBase.saySaved   = (    ) => ws.send('db-dumped');
  dataBase.sendUnlink = (path) => ws.send('unlink', path);

  ws.on('message', (msg) => {
    msg = JSON.parse(msg);
    log.do('client', 'message from client: ' + msg.type);
    switch (msg.type) {
      case 'reqFiles':
        sendAllFiles(ws); break;
      case 'reqConf':
        ws.send('config', config); break;
      case 'upload':
        droppedFile(msg.data); break;
      case 'upd-config':
        updateConfig(msg.data); break;
      case 'upd-img':
        updateImg(msg.data); break;
      case 'toggle-hid':
        dataBase.get(msg.data.path).hidden = msg.data.value;
        break;
      case 'toggle-fav':
        dataBase.get(msg.data.path).favorite = msg.data.value;
        break;
      case 'dump-db':
        dataBase.save(); break;
    }
  });
});

//==============FUNCS================//
const updateImg = (path) => {
  config["source_image"] = path;
  fs.writeFile(cfg.configFile, JSON.stringify(config, null, 4), err => {
    if (err) {
      log.error('Error: ' + err);
      server.onlyClient.send('error', err);
    }
  });
}

const updateConfig = (data) => {
  config[data.name] = data.value;
  fs.writeFile(cfg.configFile, JSON.stringify(config, null, 4), err => {
    if (err) {
      log.error('Error: ' + err);
      server.onlyClient.send('error', err);
    }
  });
}

const droppedFile = (file) => {
  if (!validateImage(file.name))
    return server.onlyClient.send('sync-file', 
      { name: file.name, outcome: 'validation failedd' })

  const toWrite = file.data.split(',')[1];
  const path = cfg.dir + '/' + file.name;
  dataBase.set(path, undefined);

  fs.writeFile(path, toWrite, 'base64', (err) => {
    if (err) {
      log.error('Error: ' + err);
      server.onlyClient.send('sync-file', 
        { name: file.name, outcome: 'internal error: ' + err })
    }
    else {
      let nf = new File();
      nf.path = path;
      nf.mtime = Date.now();
      nf.basename = file.name;
      dataBase.set(path, nf);
      server.onlyClient.send('sync-file', { file: nf, outcome: 'ok' })
      nf.data = file.data;
    }
  });
}

const sendAllFiles = ws => {
  ws.send("rebase", Array.from(dataBase.entries()));
}
