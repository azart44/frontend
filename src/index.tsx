import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import './config/amplify';
import axios from 'axios';

// Configuration d'Axios pour l'API
axios.defaults.baseURL = "https://z8qzoeztpc.execute-api.us-east-1.amazonaws.com/prod/";

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);