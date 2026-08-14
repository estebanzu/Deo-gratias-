#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const cloudinary = require('../lib/cloudinary');
const config = require('../config');

const DIR = process.argv[2] || config.imagesDir;

// Extract base product name from filename
function getBaseProductName(filename) {
  const name = path.basename(filename, path.extname(filename));
  // Remove trailing numbers/underscores like _01, _02, _1, _2
  const base = name.replace(/[-_](\d{1,3})$/i, '');
  return base || name;
}

function cleanProductName(baseName) {
  return baseName.replace(/[-_]+/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

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

  // Group files by base product name
  const groups = {};
  files.forEach((file) => {
    const baseName = getBaseProductName(file);
    if (!groups[baseName]) groups[baseName] = [];
    groups[baseName].push(file);
  });

  const groupCount = Object.keys(groups).length;

  console.log(`\n  Found ${files.length} images → ${groupCount} products\n`);
  console.log('  ── Preview ─────────────────────────────────────');
  Object.entries(groups)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .forEach(([base, imgs]) => {
      const name = cleanProductName(base);
      if (imgs.length === 1) {
        console.log(`  ${name}`);
      } else {
        console.log(`  ${name} (${imgs.length} images)`);
        imgs.forEach((f) => console.log(`    · ${f}`));
      }
    });
  console.log('  ───────────────────────────────────────────────\n');

  // Upload
  let ok = 0;
  let skip = 0;
  let fail = 0;
  const uploaded = {};

  for (const file of files) {
    const filePath = path.join(dir, file);
    const name = path.basename(file, path.extname(file));
    const baseName = getBaseProductName(file);

    try {
      const exists = await cloudinary.imageExists(name);
      if (exists) {
        console.log(`  skip  ${file}`);
        skip++;
        if (!uploaded[baseName]) uploaded[baseName] = [];
        uploaded[baseName].push(file);
        continue;
      }

      await cloudinary.uploadImage(filePath, file);
      console.log(`  done  ${file}`);
      ok++;
      if (!uploaded[baseName]) uploaded[baseName] = [];
      uploaded[baseName].push(file);
    } catch (err) {
      console.error(`  fail  ${file}  ${err.message}`);
      fail++;
    }
  }

  // Summary
  const uploadedGroups = {};
  Object.entries(uploaded).forEach(([base, imgs]) => {
    const name = cleanProductName(base);
    if (!uploadedGroups[name]) uploadedGroups[name] = imgs.length;
  });

  console.log('\n  ── Summary ─────────────────────────────────────');
  console.log(`  Uploaded: ${ok}  Skipped: ${skip}  Failed: ${fail}`);
  console.log(`  Products: ${Object.keys(uploadedGroups).length}`);
  console.log('  ───────────────────────────────────────────────\n');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
