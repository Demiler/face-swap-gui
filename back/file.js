class File {
  constructor() {
    this.path = undefined;
    this.data = undefined;
    this.mtime = undefined;
    this.basename = undefined;
    this.hidden = false;
    this.favorite = false;
  }

  lite() {
    return {
      path: this.path,
      hidden: this.hidden,
      favorite: this.favorite,
    }
  }

  fromLite(lt) {
    this.path = lt.path;
    this.hidden = lt.hidden;
    this.favorite = lt.favorite;
    this.basename = lt.path.split(/(\\|\/)/g).pop();
  }
};

module.exports.File = File;
