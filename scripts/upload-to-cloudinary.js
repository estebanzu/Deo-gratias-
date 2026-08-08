#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const cloudinary = require('../lib/cloudinary');
const config = require('../config');

const DIR = process.argv[2] || config.imagesDir;
const folder = config.cloudinary.folder || undefined;

async function main() {
  const dir = path.resolve(DIR);
  if (!fs.existsSync(dir)) {
    console.error(`  Directory not found: ${dir}`);
    process.exit(1);
  }

  const exts = ['.jpg', '.jpeg', '.png', '.webp'];
  const files = fs.readdirSync(dir).filter((f) => exts.includes(path.extname(f).toLowerCase()));

  if (files.length === 0) {
    console.log(`  No images found in ${dir}`);
    return;
  }

  console.log(`\n  Uploading ${files.length} images from ${dir}\n`);

  let ok = 0;
  let skip = 0;
  let fail = 0;

  for (const file of files) {
    const filePath = path.join(dir, file);
    const name = path.basename(file, path.extname(file));

    try {
      const exists = await cloudinary.imageExists(name);
      if (exists) {
        console.log(`  skip  ${file}`);
        skip++;
        continue;
      }

      await cloudinary.uploadImage(filePath, file);
      console.log(`  done  ${file}`);
      ok++;
    } catch (err) {
      console.error(`  fail  ${file}  ${err.message}`);
      fail++;
    }
  }

  console.log(`\n  Uploaded: ${ok}  Skipped: ${skip}  Failed: ${fail}\n`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
