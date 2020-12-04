const isImage = require('is-image');

const validateImage = (path) => !path.endsWith(".gif") && isImage(path);

module.exports = { validateImage };
