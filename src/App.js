import React, { useEffect, useRef, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import {
  Fab,
} from '@material-ui/core';
import {
  AddAPhoto,
} from '@material-ui/icons';
import md5 from 'md5';
// import logo from './logo.svg';
// import './App.css';

const SERVER_PORT = 8080;

const FINGERPRINT_COOKIE_NAME = 'memoryFingerprint';
const useUniqueCookie = () => {
  const [cookie, setCookie] = useState(null);

  useEffect(() => {
    if (cookie) return;

    const cookies = Object.fromEntries(
      window.document.cookie
        .replace(/;\s*/g, '\n')
        .matchAll(/^[^=]*(?=(?:=(.*))?)/gm)
    );

    if (cookies[FINGERPRINT_COOKIE_NAME]) {
      setCookie(cookies[FINGERPRINT_COOKIE_NAME]);
    } else {
      const cookieValue = md5([Date.now(), 0^(Math.random() * (1<<16))].join('.')).slice(-12);
      document.cookie = `${FINGERPRINT_COOKIE_NAME}=${encodeURIComponent(cookieValue)};max-age=${86400 * 365}`;
      setCookie(cookieValue);
    }
  }, [cookie]);

  return cookie;
};

const useStyles = makeStyles(() => ({
  main: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundSize: 'contain',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center',
  },
  uploadButton: {
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
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
}));

function App() {
  const classes = useStyles();
  const formEl = useRef(null);
  const [file, setFile] = useState(null);
  const [recentUpload, setRecentUpload] = useState(null);
  const cookie = useUniqueCookie();

  useEffect(() => {
    if (!file) return;

    const url = String(Object.assign(new URL(window.location.href), {
      port: SERVER_PORT,
      pathname: '/photos',
    }));

    const xhr = new XMLHttpRequest();
    xhr.open('POST', url, true);
    xhr.onload = () => {
      try {
        const { url } = JSON.parse(xhr.responseText);
        setRecentUpload(url);
      } catch (err) {}
    };
    const data = new FormData(formEl.current);
    data.set('cookie', cookie);
    xhr.send(data);

    return () => xhr.abort();
  }, [file]);

  return <>
    <form encType="multipart/form-data" method="post" className={classes.main} ref={formEl}>
      <Fab color="primary" className={classes.uploadButton}>
        <label className={classes.uploadButtonLabel}>
          <input
            name="photo"
            type="file"
            accept="image/*"
            capture="camera"
            className={classes.uploadInput}
            onChange={evt => setFile(evt.target.files[0])}
          />
        </label>
        <AddAPhoto />
      </Fab>
    </form>

    {(recentUpload) && <>
      <main className={classes.main} style={{ backgroundImage: `url(${recentUpload})` }}></main>
    </>}
  </>;
}

export default App;
