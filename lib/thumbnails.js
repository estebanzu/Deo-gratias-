const { thumbUrl: cloudThumbUrl } = require('./cloudinary');

const THUMB_WIDTH = 200;

function getThumbUrl(filename) {
  return cloudThumbUrl(filename);
}

// No-ops for backward compatibility — thumbnails are handled by Cloudinary
async function ensureThumb(_imagesDir, _filename) {
  return null;
}

function thumbExists(_imagesDir, _filename) {
  return true;
}

function getThumbDir(_imagesDir) {
  return null;
}

module.exports = { ensureThumb, thumbExists, getThumbUrl, getThumbDir, THUMB_WIDTH };
