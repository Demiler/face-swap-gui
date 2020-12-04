const fs = require('fs');
const { validateImage } = require('./validateImage.js')
const { log } = require('./logger.js');
const { File } = require('./file.js');

log.setLog('db', true);

let dataBase = new Map();
global.db = dataBase;
dataBase.saveFile = './db.cache';
dataBase.semafore = 0;

dataBase.sendFile = () => {};
dataBase.sendChange = () => {};
dataBase.saySaved = () => {};
dataBase.sendUnlink = () => {};

dataBase.addImg = (path, send = true) => {
  if (dataBase.has(path))
    return log.do('db', 'ignored existing file' + path);
  if (!validateImage(path))
    return log.do('db', 'ignored not image file' + path);

  log.do('db', 'adding "' + path + '"');

  let file = new File();
  dataBase.semafore++;
  dataBase.set(path, file);
  fs.readFile(path, 'base64', (err, img) => {
    if (err) {
      dataBase.semafore--;
      return log.error(err);
    }
    mime = "data:image/" + path.split('.').pop() + ";base64,";

    file.basename = path.split(/(\\|\/)/g).pop();
    file.mtime = fs.statSync(path).mtimeMs;
    file.path = path;
    file.data = mime + img;
    dataBase.set(path, file);
    if (send)
      dataBase.sendFile(file);
    dataBase.semafore--;
  });
};

dataBase.delImg = (path) => {
  log.do('db', 'deleting: ' + path);
  dataBase.delete(path);
  dataBase.sendUnlink(path);
}

dataBase.change = (path, send = true) => {
  let file = dataBase.get(path);
  if (file === undefined)
    return log.error("\"" + path + "\" not found to be changed");
  log.do('db', 'changing file ' + path);

  dataBase.semafore++;
  fs.readFile(path, 'base64', (err, img) => {
    if (err) {
      dataBase.semafore--;
      return log.error(err);
    }

    file.mtime = fs.statSync(path).mtimeMs;
    mime = "data:image/" + path.split('.').pop() + ";base64,";
    file.data = mime + img;
    dataBase.set(path, file);

    if (send)
      dataBase.sendChange(file);
    dataBase.semafore--;
  });
}

dataBase.save = () => {
  log.do('db', 'Dumping database on disk');
  let toWrite = [];
  dataBase.forEach((file, path) => toWrite.push(file.lite()));

  fs.writeFile(dataBase.saveFile, JSON.stringify(toWrite), err => {
    if (err)
      return log.error(err);
    dataBase.saySaved();
  });
}

dataBase._init = () => {
  log.me('Initializing dataBase');

  dataBase.sendFile = () => log.error('db: sendFile method is not set');
  dataBase.sendChange = () => log.error('db: sendChange method is not set');
  dataBase.saySaved = () => log.error('db: saySaved method in not set');
  dataBase.sendUnlink = () => log.error('db: sendUnlink method in not set');

  if (!fs.existsSync(dataBase.saveFile))
    return log.do('db', 'data base save file not found');

  let saveDB = JSON.parse(fs.readFileSync(dataBase.saveFile, 'utf8'));
  global.file = saveDB;
  saveDB.forEach(saved => {
    if (fs.existsSync(saved.path)) {
      let file = dataBase.get(saved.path);
      if (file === undefined) {
        dataBase.set(saved.path, saved);
        dataBase.change(saved.path, false);
      }
      else {
        file.favorite = saved.favorite;
        file.hidden = saved.hidden;
      }
    }
  });
}

dataBase.init = () => {
  if (dataBase.ready())
    return dataBase._init();

  const retry = setInterval(() => {
    if (!dataBase.ready())
      return;
    clearInterval(retry);
    dataBase._init();
  }, 500);
}

dataBase.ready = () => dataBase.semafore === 0;

module.exports = { dataBase };
