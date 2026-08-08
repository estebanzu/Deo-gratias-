const cloudinary = require('cloudinary').v2;
const config = require('../config');

cloudinary.config({
  cloud_name: config.cloudinary.cloudName,
  api_key: config.cloudinary.apiKey,
  api_secret: config.cloudinary.apiSecret,
  secure: true,
});

const FOLDER = config.cloudinary.folder;
const THUMB_WIDTH = 400;
const THUMB_QUALITY = 'auto';

function publicIdFromFilename(filename) {
  const ext = require('path').extname(filename).toLowerCase();
  const base = filename.slice(0, -ext.length);
  return `${FOLDER}/${base}`;
}

function filenameFromPublicId(pid) {
  const name = pid.split('/').pop();
  const ext = require('path').extname(name).toLowerCase();
  if (ext) return name;
  return name + '.jpg';
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
  const result = await cloudinary.api.resources({
    type: 'upload',
    prefix: `${FOLDER}/`,
    max_results: 500,
  });
  return result.resources;
}

async function uploadImage(filePath, originalFilename) {
  const result = await cloudinary.uploader.upload(filePath, {
    folder: FOLDER,
    public_id: originalFilename
      ? require('path').basename(originalFilename, require('path').extname(originalFilename))
      : undefined,
    overwrite: false,
    resource_type: 'image',
  });
  return result;
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
