const { parse } = require('url');
const fetch = require('node-fetch');
const { createCanvas, loadImage, registerFont } = require('canvas');

/* Load Archivo font */
registerFont(__dirname + '/fonts/archivo_bold.ttf', {
  family: 'Archivo',
  weight: 'bold'
});

/* Dimensions */
const WIDTH = 1400;
const HEIGHT = 800;

/* Styles */
const color = '#ffffff';
const backgroundColor = '#000000';

const logoPromise = loadImage(__dirname + '/images/import.png');

async function fetchImage(url) {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`${url} failed ${res.status}`);
  }
  const image = await loadImage(await res.buffer());
  return image;
}

module.exports = async (req, res) => {
  let repo, org;
  const { pathname } = parse(req.url, true);
  const parts = pathname.substring(1).split('/');

  switch (parts.length) {
    case 1:
      repo = decodeURIComponent(parts[0] || 'import');
      break;
    case 2:
      org = decodeURIComponent(parts[0]);
      repo = decodeURIComponent(parts[1]);
      break;
  }

  const ops = [ logoPromise ];
  if (org) {
    const avatarUrl = `https://github.com/${org}.png`;
    ops.push(fetchImage(avatarUrl));
  }
  const [ logo, avatar ] = await Promise.all(ops);

  const canvas = createCanvas(WIDTH, HEIGHT);
  const ctx = canvas.getContext('2d');
  ctx.patternQuality = 'best';

  // Measure title dimensions
  ctx.font = 'bold 4.4em Archivo';
  const text = ctx.measureText(repo);
  const textWidth = text.width;
  const textHeight = text.actualBoundingBoxAscent + text.actualBoundingBoxDescent;

  const logoWidth = logo.width * 0.465;
  const logoHeight = logo.height * 0.465;

  const avatarWidth = logoHeight;
  const avatarHeight = logoHeight;

  const padding = 40;

  const boundingBoxWidth = textWidth + logoWidth + padding;
  //const boundingBoxHeight = Math.max(textHeight, logoHeight, avatarHeight);
  const boundingBoxHeight = Math.max(textHeight, logoHeight);
  const boundingBoxX = (WIDTH / 2) - (boundingBoxWidth / 2);
  const boundingBoxY = (HEIGHT / 2) - (boundingBoxHeight / 2);

  // Draw background
  ctx.fillStyle = backgroundColor;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  // Draw bounding box (debug)
  //ctx.fillStyle = 'red';
  //ctx.fillRect(boundingBoxX, boundingBoxY, boundingBoxWidth, boundingBoxHeight);

  ctx.fillStyle = 'blue';
  //ctx.fillRect(WIDTH / 2, 0, 1, HEIGHT);
  //ctx.fillRect(0, HEIGHT / 2, WIDTH, 1);

  let logoX = boundingBoxX;
  let logoY = boundingBoxY;
  let titleX = boundingBoxX + logoWidth + padding;
  let titleY = (HEIGHT / 2);
  let textBaseline = 'middle';

  if (avatar) {
    // Draw avatar
    let avatarX = (WIDTH / 2) + (padding / 2);
    let avatarY = (HEIGHT / 2) - avatarHeight - (padding / 2);
    ctx.drawImage(avatar, avatarX, avatarY, avatarWidth, avatarHeight);

    // Adjust title
    textBaseline = 'top';
    titleX = (WIDTH / 2) - (textWidth / 2);

    // Adjust logo
    logoX = (WIDTH / 2) - logoWidth - (padding / 2);
    logoY = (HEIGHT / 2) - logoHeight - (padding / 2);
  }

  // Draw logo
  ctx.drawImage(logo, logoX, logoY, logoWidth, logoHeight);

  // Draw title
  ctx.textBaseline = textBaseline;
  ctx.fillStyle = color;
  ctx.fillText(repo, titleX, titleY);

  res.setHeader('Content-Type', 'image/png');
  canvas.createPNGStream().pipe(res);
};
