const cloudinary = require('cloudinary').v2;
const config = require('../config');

cloudinary.config({
  cloud_name: config.cloudinary.cloudName,
  api_key: config.cloudinary.apiKey,
  api_secret: config.cloudinary.apiSecret,
  secure: true,
});

const FOLDER = config.cloudinary.folder; // empty string = root level
const THUMB_WIDTH = 400;
const THUMB_QUALITY = 'auto';

function publicIdFromFilename(filename) {
  // filename is the full public_id (e.g. "IMG_7813_fjqzot" or "jewelry/IMG_7813_fjqzot")
  return filename.replace(/\.[^.]+$/, '');
}

function filenameFromPublicId(pid) {
  // pid is the full Cloudinary public_id (e.g. "IMG_7813_fjqzot" or "jewelry/IMG_7813_fjqzot")
  const name = pid.split('/').pop();
  const ext = require('path').extname(name).toLowerCase();
  if (ext) return name;
  return name + '.png'; // default to png since all your images are png
}

function thumbUrl(filename) {
  const pid = publicIdFromFilename(filename);
  return cloudinary.url(pid, {
    width: THUMB_WIDTH,
    crop: 'limit',
    format: 'webp',
    quality: THUMB_QUALITY,
    secure: true,
  });
}

function fullUrl(filename) {
  const pid = publicIdFromFilename(filename);
  return cloudinary.url(pid, {
    quality: 'auto',
    secure: true,
  });
}

async function listImages() {
  const opts = { type: 'upload', max_results: 500 };
  if (FOLDER) opts.prefix = `${FOLDER}/`;
  const result = await cloudinary.api.resources(opts);
  return result.resources;
}

async function uploadImage(filePath, originalFilename) {
  const opts = {
    overwrite: false,
    resource_type: 'image',
  };
  if (FOLDER) opts.folder = FOLDER;
  if (originalFilename) {
    opts.public_id = require('path').basename(originalFilename, require('path').extname(originalFilename));
  }
  return cloudinary.uploader.upload(filePath, opts);
}

async function deleteImage(filename) {
  const pid = publicIdFromFilename(filename);
  return cloudinary.uploader.destroy(pid, { resource_type: 'image' });
}

async function imageExists(filename) {
  try {
    const pid = publicIdFromFilename(filename);
    await cloudinary.api.resource(pid, { resource_type: 'image' });
    return true;
  } catch {
    return false;
  }
}

module.exports = {
  cloudinary,
  thumbUrl,
  fullUrl,
  listImages,
  uploadImage,
  deleteImage,
  imageExists,
  publicIdFromFilename,
  filenameFromPublicId,
};
