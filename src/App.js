import React, { useEffect, useRef, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import {
  Fab,
} from '@material-ui/core';
import {
  AddAPhoto,
} from '@material-ui/icons';
// import logo from './logo.svg';
// import './App.css';

const SERVER_PORT = 8080;

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
    xhr.send(data);

    return () => xhr.abort();
  }, [file]);

  return <>
    <form enctype="multipart/form-data" method="post" className={classes.main} ref={formEl}>
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
