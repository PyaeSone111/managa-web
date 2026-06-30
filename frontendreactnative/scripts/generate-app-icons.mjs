import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const src = path.join(root, 'assets', 'appicon.jpg');

const androidSizes = {
  'mipmap-mdpi': 48,
  'mipmap-hdpi': 72,
  'mipmap-xhdpi': 96,
  'mipmap-xxhdpi': 144,
  'mipmap-xxxhdpi': 192,
};

const iosIcons = [
  { name: 'Icon-App-20x20@2x.png', size: 40 },
  { name: 'Icon-App-20x20@3x.png', size: 60 },
  { name: 'Icon-App-29x29@2x.png', size: 58 },
  { name: 'Icon-App-29x29@3x.png', size: 87 },
  { name: 'Icon-App-40x40@2x.png', size: 80 },
  { name: 'Icon-App-40x40@3x.png', size: 120 },
  { name: 'Icon-App-60x60@2x.png', size: 120 },
  { name: 'Icon-App-60x60@3x.png', size: 180 },
  { name: 'Icon-App-1024x1024@1x.png', size: 1024 },
];

async function writePng(outputPath, size) {
  await fs.promises.mkdir(path.dirname(outputPath), { recursive: true });
  await sharp(src).resize(size, size, { fit: 'cover' }).png().toFile(outputPath);
}

for (const [folder, size] of Object.entries(androidSizes)) {
  const dir = path.join(root, 'android', 'app', 'src', 'main', 'res', folder);
  await writePng(path.join(dir, 'ic_launcher.png'), size);
  await writePng(path.join(dir, 'ic_launcher_round.png'), size);
  console.log(`Android ${folder}: ${size}px`);
}

const iosDir = path.join(root, 'ios', 'MyangarMobile', 'Images.xcassets', 'AppIcon.appiconset');
for (const { name, size } of iosIcons) {
  await writePng(path.join(iosDir, name), size);
  console.log(`iOS ${name}: ${size}px`);
}

console.log('App icons generated from assets/appicon.jpg');
