const cors = require('cors');
const express = require('express');
const fileUpload = require('express-fileupload');
const fs = require('fs');
const https = require('https');
const { get } = require('lodash');
const moment = require('moment');
const path = require('path');

const PORT = 8080;

const app = express();
app.use(cors());
app.use(fileUpload({
  useTempFiles: true,
  tempFileDir: '/tmp/',
}));

{ const dirname = 'photos';
  app.use(`/${dirname}`, express.static(`./${dirname}`));
}

app.post('/photos', (req, res) => {
  const urls = (() => {
    const photo = get(req, ['files', 'photo'], null);
    if (photo) {
      const urlPrefix = `${req.protocol}://${req.get('host')}/photos`;
      const photos = (Array.isArray(photo))
        ? photo
        : [photo];
      const dirname = './photos';
      return photos.map((photo, index) => {
        const extension = photo.name.match(/[^.]*$/);
        const filename = [
          req.body.cookie,
          moment().format('YYYY-MM-DD-HH-mm-ss-SSS'),
          String(index).padStart(4, 0),
          extension,
        ].join('.');

        const relpath = `${dirname}/${filename}`;
        try {
          photo.mv(relpath);
        } catch (err) {
          fs.mkdirSync(dirname);
          photo.mv(relpath);
        }

        return `${urlPrefix}/${filename}`;
      });
    }
    // else ...
    return null;
  })();

  res.send(JSON.stringify({ urls }));
});
app.get('/photos', (req, res) => {
  const contents = (() => {
    const relpath = './photos';
    try {
      return fs.readdirSync(relpath);
    } catch (err) {
      fs.mkdirSync(relpath);
      return [];
    }
  })();
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

server.listen(PORT, () => {
  const strNow = moment().format('YYYY-MM-DD HH:mm:ss.SSS');
  console.log(`(${strNow})`, 'Started on port', PORT);
});
