import { useEffect, useState } from 'react';
import md5 from 'md5';

export default (cookieName) => {
  const [cookie, setCookie] = useState(null);

  useEffect(() => {
    if (cookie) return;

    const cookies = Object.fromEntries(
      window.document.cookie
        .replace(/;\s*/g, '\n')
        .matchAll(/^[^=]*(?=(?:=(.*))?)/gm)
    );

    if (cookies[cookieName]) {
      setCookie(cookies[cookieName]);
    } else {
      const cookieValue = md5([Date.now(), 0^(Math.random() * (1<<16))].join('.')).slice(-12);
      document.cookie = `${cookieName}=${encodeURIComponent(cookieValue)};max-age=${86400 * 365}`;
      setCookie(cookieValue);
    }
  }, [cookie]);

  return cookie;
};
