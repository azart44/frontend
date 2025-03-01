import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import './index.css';
import App from './App';
import './config/amplify';
import { queryClient } from './utils/queryClient';
import axios, { InternalAxiosRequestConfig, AxiosResponse } from 'axios';

// Extend AxiosRequestConfig with custom metadata
declare module 'axios' {
  interface InternalAxiosRequestConfig {
    metadata?: {
      startTime: Date;
      endTime?: Date;
    };
  }
  interface AxiosResponse {
    duration?: number;
  }
}

// Optimized Axios configuration
axios.defaults.baseURL = "https://z8qzoeztpc.execute-api.us-east-1.amazonaws.com/prod/";
axios.defaults.timeout = 5000;

// Performance tracking interceptor
axios.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  config.metadata = { startTime: new Date() };
  return config;
});

axios.interceptors.response.use(
  (response: AxiosResponse) => {
    if (response.config.metadata) {
      response.config.metadata.endTime = new Date();
      response.duration = response.config.metadata.endTime.getTime() - response.config.metadata.startTime.getTime();
    }
    return response;
  },
  (error) => {
    console.error('API Call Error:', error);
    return Promise.reject(error);
  }
);

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  </React.StrictMode>
);