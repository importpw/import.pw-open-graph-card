const { parse } = require('url');
const fetch = require('node-fetch');
const { createCanvas, loadImage, registerFont } = require('canvas');
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

module.exports = async (req, res) => {
  const { pathname } = parse(req.url, true);
  const [ org, repo ] = pathname.substring(1).split('/');

  const avatarUrl = `https://github.com/${org}.png`;
  const [ logo, avatarRes ] = await Promise.all([
    logoPromise,
    fetch(avatarUrl)
  ]);
  const avatar = await loadImage(await avatarRes.buffer());

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

  const avatarWidth = 140;
  const avatarHeight = 140;

  const padding = 40;

  const boundingBoxWidth = textWidth + logoWidth + padding;
  //const boundingBoxHeight = Math.max(textHeight, logoHeight, avatarHeight);
  const boundingBoxHeight = Math.max(textHeight, logoHeight);
  const boundingBoxX = (WIDTH / 2) - (boundingBoxWidth / 2);
  const boundingBoxY = (HEIGHT / 2) - (boundingBoxHeight / 2);

  //ctx.fillStyle = 'red';
  //ctx.fillRect(0, 0, text.actualBoundingBoxRight, textHeight);

  // Draw background
  ctx.fillStyle = backgroundColor;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  // Draw bounding box (debug)
  //ctx.fillStyle = 'red';
  //ctx.fillRect(boundingBoxX, boundingBoxY, boundingBoxWidth, boundingBoxHeight);

  // Draw logo
  const logoX = boundingBoxX;
  const logoY = boundingBoxY;
  ctx.drawImage(logo, logoX, logoY, logoWidth, logoHeight);

  // Draw avatar
  //const avatarX = 0;
  //const avatarY = 0;
  //ctx.drawImage(avatar, avatarX, avatarY, avatarWidth, avatarHeight);

  // Draw title
  const titleX = boundingBoxX + logoWidth + padding;
  const titleY = (HEIGHT / 2);
  ctx.textBaseline = 'middle';
  ctx.fillStyle = color;
  ctx.fillText(repo, titleX, titleY);

  res.setHeader('Content-Type', 'image/png');
  canvas.createPNGStream().pipe(res);
};
