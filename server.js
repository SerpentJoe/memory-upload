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

app.get('/', (req, res) => {
  res.send('yar');
});

app.post('/photos', (req, res) => {
  const url = (() => {
    const photo = get(req, ['files', 'photo'], null);
    // const filename = get(req, ['files', 'photo', 'name'], null);
    if (photo) {
      const extension = photo.name.match(/[^.]*$/);
      const filename = `${req.body.cookie}.${moment().format('YYYY-MM-DD-HH-mm-ss-SSS')}.${extension}`;
      photo.mv(`./photos/${filename}`);
      return `${req.protocol}://${req.get('host')}/photos/${filename}`;
    }
    // else ...
    return null;
  })();

  res.send(JSON.stringify({ url }));
});
app.get('/photos', (req, res) => {
  const contents = fs.readdirSync('./photos');
  const urls = contents
    .filter(str => !/DS_Store/i.test(str))
    .map(filename => `${req.protocol}://${req.get('host')}/photos/${filename}`)
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
