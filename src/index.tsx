import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { Amplify } from 'aws-amplify';
import axios from 'axios';

Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: process.env.REACT_APP_USER_POOL_ID!,
      userPoolClientId: process.env.REACT_APP_USER_POOL_CLIENT_ID!,
      signUpVerificationMethod: 'code',
    }
  }
});

// Configuration d'Axios pour l'API
axios.defaults.baseURL = "https://r80w1ax6u0.execute-api.us-east-1.amazonaws.com/prod";

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);