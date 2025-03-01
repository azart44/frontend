import 'axios';

declare module 'axios' {
  interface InternalAxiosRequestConfig {
    metadata?: {
      startTime: number;
    };
  }
  
  export interface AxiosResponse {
    duration?: number;
  }
}