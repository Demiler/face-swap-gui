import { LitElement, css, html } from 'lit-element'
import { style } from '../css/style.js'
import { api } from '../js/api.js'

class Explorer extends LitElement {
  static get styles() {
    return style;
  }

  static get properties() {
    return {
      files: { type: Array },
      state: { type: String },
    };
  }

  constructor() {
    super();
    this.files = [];
    this.state = "waiting-for-files";

    api.on('rebase', (files) => {
      this.files = files.map(file => {
        return {
          basename: file[0].split(/(\\|\/)/g).pop(),
          path: file[0],
          data: file[1]
        }
      });
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
        path: file.path,
        data: file.data,
        basename: file.path.split(/(\\|\/)/g).pop()
      });
      this.requestUpdate();
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

    setTimeout(() => api.send('reqFiles'), 100);
  }

  render() {
    switch (this.state) {
      case "waiting-for-files":
        return this.renderLoading();
      case "display-files":
        return this.renderFiles();
    }
  }

  renderLoading() {
    return html`
      <div class="loading">Loading</div>
    `;
  }

  renderFiles() {
    return html`
      <div class="files-container">
        ${this.files.map(file => html`
          <div class="file-wrap" @click=${this.chooseImg}>
            <img src="${file.data}">
            <span>${file.basename}</span>
          </div>
        `)}
      </div>
    `;
  }

  loadFile(e) {
    this.classList.remove('shadow');
    let files = e.dataTransfer.files;
    for (let i = 0; i < files.length; i++) {
      new Promise((res, rej) => {
        const reader = new FileReader();
        reader.readAsDataURL(files[i]);
        reader.onload = () => res(reader.result);
        reader.onerror = err => console.log('Error ', err);
      }).then(data => api.send('upload', {name: files[i].name, data}));
    }
  }

  chooseImg(e) {
  }
};

customElements.define('le-exp', Explorer);
