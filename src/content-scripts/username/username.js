window.addEventListener('message', (event) => {
  if (event.source !== window) return;
  if (event.data.type && event.data.type === 'GET_USERNAME') {
    const username = localStorage.getItem('username');
    window.postMessage({ type: 'USERNAME_RESPONSE', username: username || null }, '*');
  }
}, false);