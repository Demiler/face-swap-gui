import { LitElement, css, html } from 'lit-element'
import { style } from '../css/style.js'
import { api } from './api.js'
import { hotkeys } from './hotkeys.js'
const { File } = require('../../back/file.js');

class Explorer extends LitElement {
  static get styles() {
    return style;
  }

  static get properties() {
    return {
      files: { type: Array },
      state: { type: String },
      hider: { type: Boolean },
      favonly: { type: Boolean },
      showhid: { type: Boolean },
    };
  }

  constructor() {
    super();
    this.activeFile = undefined;
    this.files = [];
    //this.state = "waiting-for-files";
    this.state = "display-files";
    this.hider = false;
    this.favonly = false;
    this.showhid = false;
    this.lastDump = Date.now();

    api.on('rebase', (db) => {
      this.files = db.map(data => data[1]);
      this.state = "display-files";
    });

    api.on('unlink', (unlinked) => {
      this.files = this.files.filter(file => file.path != unlinked);
      this.requestUpdate();
    });

    api.on('change', (changed) => {
      let file = this.files.find(file => file.path === changed.path);
      file.data = changed.data;
      this.requestUpdate();
    });

    api.on('new-file', (file) => {
      this.files.push({
        hidden: false,
        display: true,
        favorite: false,
        active: false,
        path: file.path,
        data: file.data,
        basename: file.path.split(/(\\|\/)/g).pop()
      });
      this.requestUpdate();
    });

    api.on('config', (conf) => {
      this.buttons.forEach(button =>
        button.value = conf[button.confname]
      );
      if (this.files.length === 0)
        return;

      this.activeFile = this.files.find(file => file.path === conf['source_image']);
      if (this.activeFile === undefined) {
        [this.activeFile] = this.files;
        this.updateImage(this.activeFile);
      }
      else
        this.activeFile.active = true;

      this.requestUpdate();
    });

    api.on('db-dumped', () => {
      this.lastDump = Date.now();
      console.log(this.lastDump);
    });

    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
      this.addEventListener(eventName, e => {
        e.preventDefault()
        e.stopPropagation()
      }, false);
    });

    this.addEventListener('dragenter', () => {
      this.classList.add('shadow');
    });

    this.addEventListener('dragleave', () => {
      this.classList.remove('shadow');
    });

    this.addEventListener('drop', this.loadFile);

    this.buttons = [
      { label: "CPU",        confname: "cpu",         value: false },
      { label: "CVCPU",      confname: "cvcpu",       value: false },
      { label: "Watch",      confname: "watch",       value: false },
      { label: "Noop",       confname: "noop",        value: false },
      { label: "FPS",        confname: "fps",         value: false },
      { label: "Flow",       confname: "flow",        value: false },
      { label: "Relative",   confname: "relative",    value: false },
      { label: "Adaptive",   confname: "adapt_scale", value: false },
      { label: "Recording",  confname: "recording",   value: false },
      { label: "Reoptimize", confname: "reoptimize",  value: false },
    ];
    hotkeys.bind('1', () => this.updateConfig(this.buttons[0]));
    hotkeys.bind('2', () => this.updateConfig(this.buttons[1]));
    hotkeys.bind('3', () => this.updateConfig(this.buttons[2]));
    hotkeys.bind('4', () => this.updateConfig(this.buttons[3]));
    hotkeys.bind('5', () => this.updateConfig(this.buttons[4]));
    hotkeys.bind('6', () => this.updateConfig(this.buttons[5]));
    hotkeys.bind('7', () => this.updateConfig(this.buttons[6]));
    hotkeys.bind('8', () => this.updateConfig(this.buttons[7]));
    hotkeys.bind('9', () => this.updateConfig(this.buttons[8]));
    hotkeys.bind('0', () => this.updateConfig(this.buttons[9]));
    hotkeys.bind('s', () => this.showhid = !this.showhid);
    hotkeys.bind('f', () => this.favonly = !this.favonly);

    setTimeout(() => api.send('reqFiles'), 100);
    setTimeout(() => api.send('reqConf'), 200);

    const updater = setInterval(() => this.requestUpdate(), 60000);
  }

  dumpTime() {
    let diff = (Date.now() - this.lastDump) / 60000; //to min
    if (diff < 1)
      return 'recently';
    return Number(diff).toFixed(0) + ' mins ago';
  }

  render() {
    switch (this.state) {
      case "waiting-for-files":
        return this.renderLoading();
      case "display-files":
        return this.renderControls();
      case 'buttons':
        return this.renderButtons();
    }
  }

  renderControls() {
    return html`
      <div class="ctrl-container ${this.hider ? 'hider' : ''}">
        ${this.renderButtons()}
        <div class='tools-container'>
          <button class='btn-push btn-hider ${this.hider}' 
            @click=${() => this.hider = !this.hider}>hider</button>

          <button class='btn-push btn-showhid ${this.showhid}' 
          @click=${() => this.showhid = !this.showhid}>
            show hidden (${this.files.filter(file => this.isHidden(file)).length})
          </button>

          <button class='btn-push btn-favorite ${this.favonly}' 
          @click=${() => this.favonly = !this.favonly}>favorite only</button>

          <button class='btn-push btn-dump false' 
                  @click=${() => api.send('dump-db')}>
                  dump on disk (${this.dumpTime()})
          </button>
        </div>
        ${this.renderFiles()}
      </div>
    `;
  }

  renderButtons() {
    return html`
      <div class='conf-buttons'>
        ${this.buttons.map(button => html`
          <button class='btn-push btn-conf ${button.value}'
           @click=${() => this.updateConfig(button)}
           >${button.label}</button>
        `)}
      </div>
    `;
  }

  renderLoading() {
    return html`
      <div class="loading">Loading</div>
    `;
  }

  renderFiles() {
    return html`
      <div class="files-container" .hidden=${this.showhid}>
        ${this.files.map(file => html`
          <div class="file-wrap ${file.active ? 'active' : ''}
          ${file.favorite ? 'favorite' : ''}"
           @click=${(e) => this.clickImage(e, file)}
           .hidden=${this.isHidden(file)}
           >
            <img src="${file.data}">
            <span>${file.basename}</span>
            <button class="btn-fav" name="btn-fav"
            @click=${() => this.addToFav(file)}>⭐</button>
          </div>
        `)}
        ${this.files.filter(file => this.isHidden(file)).length === this.files.length ?
          html`<div>Empty! Try changing filters</div>`
          : html``}
      </div>
    `;
  }

  addToFav(img) {
    img.favorite = !img.favorite;
    api.send('toggle-fav', { path: img.path, value: img.favorite });
    this.requestUpdate();
  }

  isHidden(img) {
    return img.hidden || (this.favonly && !img.favorite);
  }

  hideImage(img) {
    img.hidden = !img.hidden;
    api.send('toggle-hid', { path: img.path, value: img.hidden });
  }

  clickImage(e, img) {
    if (e.target.name === "btn-fav")
      return;
    if (e.ctrlKey)
      this.addToFav(img)
    else if (this.hider || e.shiftKey)
      this.hideImage(img)
    else
      this.updateImage(img);
    this.requestUpdate();
  }

  updateImage(img) {
    if (this.activeFile)
      this.activeFile.active = false;
    this.activeFile = img;
    this.activeFile.active = true;

    api.send('upd-img', img.path);
    console.log('updating image', img.basename);
  }

  updateConfig(button) {
    button.value = !button.value;
    api.send('upd-config', { name: button.confname, value: button.value });
    console.log('updating config', button);
    this.requestUpdate();
  }

  loadFile(e) {
    this.classList.remove('shadow');
    let files = e.dataTransfer.files;
    let timer = undefined;
    for (let i = 0; i < files.length; i++) {
      if (!files[i].type.startsWith("image")) {
        console.log(files[i].name, 'is not supported file type');
        this.classList.add('unsupp');
        if (!timer)
          timer = setTimeout(() => this.classList.remove('unsupp'), 1000);
        continue;
      }

      new Promise((res, rej) => {
        const reader = new FileReader();
        reader.readAsDataURL(files[i]);
        reader.onload = () => res(reader.result);
        reader.onerror = err => console.log('Error ', err);
      }).then(data => api.send('upload', { name: files[i].name, data }));
    }
  }

};

customElements.define('le-exp', Explorer);
