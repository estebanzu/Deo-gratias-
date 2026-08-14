let sharp;
try {
  sharp = require('sharp');
} catch {
  sharp = null;
}

const path = require('path');
const fs = require('fs');

/**
 * Image Similarity Detection
 * Uses perceptual hashing (average hash) to find duplicate/similar images.
 * Hamming distance threshold: <=10 = very similar, <=15 = similar, >15 = different.
 */

const SIMILARITY_THRESHOLD = 12;

async function computePerceptualHash(filePath) {
  if (!sharp) return null;
  try {
    const resized = await sharp(filePath)
      .resize(16, 16, { fit: 'fill' })
      .greyscale()
      .raw()
      .toBuffer({ resolveWithObject: true });

    const pixels = resized.data;
    let sum = 0;
    for (let i = 0; i < pixels.length; i++) sum += pixels[i];
    const avg = sum / pixels.length;

    let hash = '';
    for (let i = 0; i < pixels.length; i++) {
      hash += pixels[i] >= avg ? '1' : '0';
    }
    return hash;
  } catch {
    return null;
  }
}

function hammingDistance(a, b) {
  if (a.length !== b.length) return Infinity;
  let dist = 0;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) dist++;
  }
  return dist;
}

function similarityPercent(a, b) {
  const dist = hammingDistance(a, b);
  return Math.round(((a.length - dist) / a.length) * 100);
}

async function findDuplicates(images, onProgress) {
  const hashes = [];

  for (let i = 0; i < images.length; i++) {
    const img = images[i];
    const filePath = img.filePath || img.url;
    if (!filePath) continue;

    const absPath = path.isAbsolute(filePath) ? filePath : path.resolve(process.cwd(), filePath);

    if (!fs.existsSync(absPath)) continue;

    const hash = await computePerceptualHash(absPath);
    if (hash) {
      hashes.push({ image: img, hash, filePath: absPath });
    }

    if (onProgress) onProgress(i + 1, images.length);
  }

  const groups = [];
  const processed = new Set();

  for (let i = 0; i < hashes.length; i++) {
    if (processed.has(i)) continue;

    const group = [hashes[i]];
    processed.add(i);

    for (let j = i + 1; j < hashes.length; j++) {
      if (processed.has(j)) continue;

      const dist = hammingDistance(hashes[i].hash, hashes[j].hash);
      if (dist <= SIMILARITY_THRESHOLD) {
        group.push(hashes[j]);
        processed.add(j);
      }
    }

    if (group.length > 1) {
      groups.push({
        similarity: similarityPercent(group[0].hash, group[1].hash),
        images: group.map((g) => ({
          id: g.image.id,
          name: g.image.name,
          filename: g.image.filename,
          url: g.image.thumbUrl || g.image.url,
          hash: g.hash,
        })),
      });
    }
  }

  groups.sort((a, b) => b.similarity - a.similarity);
  return groups;
}

module.exports = { computePerceptualHash, hammingDistance, similarityPercent, findDuplicates };
