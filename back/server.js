const WebSocket = require('ws');
const chokidar = require('chokidar');
const fs = require('fs');
const isImage = require('is-image');
const serveStatic = require('serve-static');
const http = require('http');
const finalhandler = require('finalhandler')
const { log } = require('./logger.js');
const { File } = require('./file.js');
const cfg = require('../config.json');

//==========================CONSTS==========================//
const SAVE_PERIOD = 1000 * 60 * 5; //5 min save period
const port = 8081
const dbFile = "./db.cache";
log.setLog('client', true);
log.setLog('db', true);
//==========================DATA BASE==========================//
let dataBase = new Map();
global.db = dataBase;
dataBase.addImg = (path, send = true) => {
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
    mime = "data:image/" + path.split('.').pop() + ";base64,";

    let file = new File();
    file.basename = path.split(/(\\|\/)/g).pop();
    file.path = path;
    file.data = mime + img;
    dataBase.set(path, file);
    if (send)
      sendFile(server.onlyClient, path);
  });
};

dataBase.change = (path, send = true) => {
  let file = dataBase.get(path);
  if (file === undefined)
    log.err(path + "not found to be changed");
  log.do('db', 'changing file ' + path);

  fs.readFile(path, 'base64', (err, img) => {
    if (err)
      log.error(err);

    mime = "data:image/" + path.split('.').pop() + ";base64,";
    file.data = mime + img;
    dataBase.set(path, file);

    if (send)
      sendChange(server.onlyClient, path);
  });
}

dataBase.save = () => {
  log.do('db', 'Dumping database on disk');
  let toWrite = [];
  dataBase.forEach((file, path) => toWrite.push(file.lite()));
  fs.writeFile(dbFile, JSON.stringify(toWrite), err => {
    if (err)
      log.error(err);
    if (server.onlyClient.readyState === WebSocket.OPEN)
      server.onlyClient.say('db-dumped')
  });
}

dataBase.init = () => {
  if (!fs.existsSync(dbFile))
    return;
  let saveDB = JSON.parse(fs.readFileSync(dbFile, 'utf8'));
  saveDB.forEach(saved => {
    let file = new File();
    if (fs.existsSync(saved.path)) {
      file.fromLite(saved);
      dataBase.set(saved.path, file);
      dataBase.change(saved.path, false);
    }
  });
}
//==========================HTTPSR==========================//
const serve = serveStatic('../build', { index: ['index.html'] })

const httpServ = http.createServer(function onRequest (req, res) {
  serve(req, res, finalhandler(req, res))
})
httpServ.listen(process.env.PORT || port);
//==========================INIT==========================//
log.me('Initializing');
log.me('Readding config ' + cfg.configFile);
let config = JSON.parse(fs.readFileSync(cfg.configFile, 'utf8'));

log.me('Initializing dataBase');
dataBase.init();

log.me('Readding default dir ' + cfg.dir);
filenames = fs.readdirSync(cfg.dir);
filenames = filenames.filter(name =>
  !name.endsWith(".gif") && isImage(cfg.dir +'/'+ name)
);
log.me('Files names filtered');

filenames.forEach(name => dataBase.addImg(cfg.dir + '/' + name, false));
log.me('Data base initialized');

global.db = dataBase;

log.me('Starting watcher');
const watcher = chokidar.watch(cfg.dir, {
  ignored: /^\./,
  persistent: true,
  depth: 0
});
watcher.on('add', dataBase.addImg);
watcher.on('change', dataBase.change);
watcher.on('unlink', path => {
  console.log('deleting: ', path);
  dataBase.delete(path);
  sendUnlink(server.onlyClient, path);
});
watcher.on('error', path => log.error('error with ' + path));

log.me('Starting server at port ' + port);
const server = new WebSocket.Server({ server: httpServ });

const saveInterval = setInterval(() => {
  dataBase.save();
}, SAVE_PERIOD);
//==============SERVER================//
server.on('connection', ws => {
  log.do('client', 'new client');
  //if (server.onlyClient)
    //server.onlyClient.say('kill');
  server.onlyClient = ws;
  ws.say = (type, data) => ws.send(JSON.stringify({ type, data }));

  ws.on('message', (data) => {
    data = JSON.parse(data);
    log.do('client', 'message from client: ' + data.type);
    switch (data.type) {
      case 'reqFiles':
        sendAllFiles(ws); break;
      case 'reqConf':
        ws.say('config', config); break;
      case 'upload':
        uploadFile(data.data); break;
      case 'upd-config':
        updateConfig(data.data); break;
      case 'upd-img':
        updateImg(data.data); break;
      case 'toggle-hid':
        dataBase.get(data.data.path).hidden = data.data.value;
        break;
      case 'toggle-fav':
        dataBase.get(data.data.path).favorite = data.data.value;
        break;
      case 'dump-db':
        dataBase.save(); break;
    }
  });
});

//==============FUNCS================//
const updateImg = path => {
  config["source_image"] = path;
  fs.writeFile(cfg.configFile, JSON.stringify(config, null, 4), err => {
    if (err)
      log.error('Error: ' + err);
  });
}

const updateConfig = (data) => {
  config[data.name] = data.value;
  fs.writeFile(cfg.configFile, JSON.stringify(config, null, 4), err => {
    if (err)
      log.error('Error: ' + err);
  });
}

const uploadFile = (file) => {
  const toWrite = file.data.split(',')[1];
  const name = cfg.dir + '/' + file.name;
  fs.writeFile(name, toWrite, 'base64', err => server.onlyClient.say('error', 'upload'));
}

const sendAllFiles = ws => {
  ws.say("rebase", Array.from(dataBase.entries()));
}

const sendFile = (ws, path) => {
  let data = dataBase.get(path);
  ws.say("new-file", {path, data});
}

const sendUnlink = (ws, path) => {
  ws.say("unlink", path);
}

const sendChange = (ws, path) => {
  let data = dataBase.get(path);
  ws.say("change", {path, data});
}
