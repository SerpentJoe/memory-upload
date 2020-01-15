import React, { useEffect, useRef, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import {
  Fab,
  Zoom,
} from '@material-ui/core';
import {
  AddAPhoto,
} from '@material-ui/icons';
import { useList } from 'react-use';
// import logo from './logo.svg';
import './App.css';
import useFingerprint from './fingerprint';

const SERVER_PORT = 8080;

const useStyles = makeStyles(() => ({
  grid: {
    display: 'grid',
    gridTemplateColumns: `repeat(3, 1fr)`,
    gridAutoRows: '33vh',
    gridRowGap: '1vh',
    gridColumnGap: '1vw',
  },
  form: {
    gridColumnStart: 2,
    gridColumnEnd: 2,
    gridRowStart: 2,
    gridRowEnd: 2,
    justifySelf: 'center',
    alignSelf: 'center',
  },
  uploadButton: {
    position: 'relative',
  },
  uploadButtonLabel: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
  },
  uploadInput: {
    position: 'absolute',
    top: '200%',
    left: '200%',
    opacity: 0,
  },
  figure: {
    margin: 0,
    backgroundSize: 'contain',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center',
    filter: 'drop-shadow(0 0 .5vh rgba(0, 0, 0, .6))',
  },
}));

function App() {
  const classes = useStyles();
  const formEl = useRef(null);
  const [files, setFiles] = useState(null);
  const [recentUploads, { push: pushRecentUploads }] = useList([]);
  const cookie = useFingerprint('memoryFingerprint');

  useEffect(() => {
    if (!files) return;

    const url = String(Object.assign(new URL(window.location.href), {
      port: SERVER_PORT,
      pathname: '/photos',
    }));

    const xhr = new XMLHttpRequest();
    xhr.open('POST', url, true);
    xhr.onload = () => {
      try {
        const { urls } = JSON.parse(xhr.responseText);
        pushRecentUploads(...urls);
      } catch (err) {}
    };
    const data = new FormData(formEl.current);
    data.set('cookie', cookie);
    xhr.send(data);

    return () => xhr.abort();
  }, [files]);

  return <>
    <main className={classes.grid}>
      <form encType="multipart/form-data" method="post" className={classes.form} ref={formEl}>
        <Fab color="primary" className={classes.uploadButton}>
          <label className={classes.uploadButtonLabel}>
            <input
              name="photo"
              type="file"
              accept="image/*"
              multiple
              className={classes.uploadInput}
              onChange={evt => setFiles([...evt.target.files])}
            />
          </label>
          <AddAPhoto />
        </Fab>
      </form>
      {(recentUploads) && <>
        {recentUploads.map((url, index) => <>
          <Zoom in>
            <figure
              key={url}
              className={classes.figure}
              style={{
                backgroundImage: (url && `url(${url})`),
              }}
            />
          </Zoom>
        </>)}
      </>}
    </main>
  </>;
}

export default App;
