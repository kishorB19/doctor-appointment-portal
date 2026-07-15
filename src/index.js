import React from 'react';
import {createRoot} from 'react-dom/client';
import App from './App';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Provider } from 'react-redux';
import { store } from './redux/store';
import { GoogleOAuthProvider } from '@react-oauth/google';

const googleClientId = process.env.REACT_APP_GOOGLE_CLIENT_ID || '73965721586-3nrepvbublogudnahqjq7pqoq118g96k.apps.googleusercontent.com';

const root = createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <Provider store={store}>
      <GoogleOAuthProvider clientId={googleClientId}>
        <App />
      </GoogleOAuthProvider>
    </Provider>
  </React.StrictMode>
);
