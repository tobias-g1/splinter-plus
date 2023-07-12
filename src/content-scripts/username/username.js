window.addEventListener(
  'message',
  (event) => {
    if (event.source !== window) return;
    if (event.data.type && event.data.type === 'GET_USERNAME') {
      let username = null;
      let newData = localStorage.getItem('persist:root');

      // Check if the new key with JSON data exists
      if (newData !== null) {
        try {
          const parsedData = JSON.parse(newData);
          const { auth } = parsedData;
          const { login } = JSON.parse(auth);
          username = login.name || null;
        } catch (error) {
          // Error occurred while parsing the JSON data
          console.error('Error parsing JSON data:', error);
        }
      }

      // If username is not found in the new data, check the legacy key
      if (!username) {
        username = localStorage.getItem('username');
      }

      // Send the username as a response
      window.postMessage(
        { type: 'USERNAME_RESPONSE', username: username },
        '*',
      );
    }
  },
  false,
);
