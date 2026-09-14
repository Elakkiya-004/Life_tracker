const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, '..', 'public');
const pngPath = path.join(publicDir, 'favicon-48x48.png');
const svgPath = path.join(publicDir, 'favicon.svg');

if (fs.existsSync(pngPath)) {
  const b64 = fs.readFileSync(pngPath).toString('base64');
  const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48" height="48">
  <rect width="48" height="48" rx="10" fill="#FFFDF7"/>
  <image href="data:image/png;base64,${b64}" width="48" height="48" />
</svg>`;
  fs.writeFileSync(svgPath, svgContent);
  console.log('Successfully updated favicon.svg with Life Wheel asset!');
} else {
  console.error('favicon-48x48.png not found');
}
