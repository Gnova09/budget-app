const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const assetsDir = path.join(__dirname, '..', 'assets', 'images');

async function generate() {
  // Icon 1024x1024
  const iconSvg = fs.readFileSync(path.join(__dirname, 'icon.svg'));
  await sharp(iconSvg).resize(1024, 1024).png().toFile(path.join(assetsDir, 'icon.png'));
  console.log('✅ icon.png');

  // Favicon 48x48
  await sharp(iconSvg).resize(48, 48).png().toFile(path.join(assetsDir, 'favicon.png'));
  console.log('✅ favicon.png');

  // Splash icon 288x288 (dark icon on transparent bg)
  const splashSvg = fs.readFileSync(path.join(__dirname, 'splash-icon.svg'));
  await sharp(splashSvg).resize(288, 288).png().toFile(path.join(assetsDir, 'splash-icon.png'));
  console.log('✅ splash-icon.png');

  // Android adaptive icon foreground 1024x1024 (white icon, transparent bg)
  const fgSvg = fs.readFileSync(path.join(__dirname, 'android-foreground.svg'));
  await sharp(fgSvg).resize(1024, 1024).png().toFile(path.join(assetsDir, 'android-icon-foreground.png'));
  console.log('✅ android-icon-foreground.png');

  // Android adaptive icon background (solid navy)
  const bgSvg = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024"><rect width="1024" height="1024" fill="#0f172a"/></svg>`);
  await sharp(bgSvg).resize(1024, 1024).png().toFile(path.join(assetsDir, 'android-icon-background.png'));
  console.log('✅ android-icon-background.png');

  // Android monochrome (same as foreground)
  await sharp(fgSvg).resize(1024, 1024).png().toFile(path.join(assetsDir, 'android-icon-monochrome.png'));
  console.log('✅ android-icon-monochrome.png');

  console.log('\nAll icons generated!');
}

generate().catch(console.error);
