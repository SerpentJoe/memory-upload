const cors = require('cors');
const express = require('express');
const fileUpload = require('express-fileupload');
const fs = require('fs');
const https = require('https');
const { get } = require('lodash');
const moment = require('moment');
const path = require('path');

const {
  SERVER_PORT,
} = require('./env');

const app = express();
app.use(cors());
app.use(fileUpload({
  useTempFiles: true,
  tempFileDir: '/tmp/',
}));

{ // Ensure photos directory exists, and share it
  const dirname = 'photos';
  const relpath = `../${dirname}`;
  try {
    fs.readdirSync(relpath);
  } catch (err) {
    fs.mkdirSync(relpath);
  } finally {
    app.use(`/${dirname}`, express.static(relpath));
  }
}

app.post('/photos', (req, res) => {
  const urls = (() => {
    const photo = get(req, ['files', 'photo'], null);
    if (photo) {
      const strTime = moment().format('YYYY-MM-DD-HH-mm-ss-SSS');
      const fingerprint = req.body.cookie;
      const urlPrefix = `${req.protocol}://${req.get('host')}/photos`;
      const photos = (Array.isArray(photo))
        ? photo
        : [photo];
      const relpath = '../photos';
      return photos.map((photo, index) => {
        const extension = photo.name.match(/[^.]*$/);
        const filename = [
          strTime,
          String(index).padStart(4, 0),
          fingerprint,
          extension,
        ].join('.');
        // Move the file out of temp storage
        photo.mv(`${relpath}/${filename}`);
        // Construct the URL
        return `${urlPrefix}/${filename}`;
      });
    }
    // else ...
    return null;
  })();

  res.send(JSON.stringify({ urls }));
});
app.get('/photos', (req, res) => {
  const contents = fs.readdirSync('../photos');
  const urlPrefix = `${req.protocol}://${req.get('host')}/photos`;
  const urls = contents
    .filter(str => !/DS_Store/i.test(str))
    .map(filename => `${urlPrefix}/${filename}`)
  res.send(JSON.stringify(urls));
});

const server = app;
// const server = https.createServer({
//   key: fs.readFileSync('./key.pem'),
//   cert: fs.readFileSync('./cert.pem'),
//   passphrase: 'component',
// }, app);

server.listen(SERVER_PORT, () => {
  const strNow = moment().format('YYYY-MM-DD HH:mm:ss.SSS');
  console.log(`(${strNow})`, 'Server running on port', SERVER_PORT);
});
