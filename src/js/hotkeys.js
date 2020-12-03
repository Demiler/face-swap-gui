class Hotkeys {
  constructor() {
    this.binded = new Map();
    document.addEventListener('keyup', (e) => {
      const bi = this.binded.get(e.key);
      if (bi)
        bi.locked = false;
    });

    document.addEventListener('keydown', (e) => {
      const bi = this.binded.get(e.key);
      if (bi && (!bi.locked || !bi.lock)) {
        bi.locked = true;
        bi.func(e);
      }
    });
  }

  bind(key, func, lock = true) {
    this.binded.set(key, { func, lock, locked: false });
  }

  unbind(key) {
    this.binded.delete(key);
  }
}

export const hotkeys = new Hotkeys();
