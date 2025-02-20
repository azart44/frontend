import axios from 'axios';
import { fetchAuthSession } from 'aws-amplify/auth';

const api = axios.create({
  baseURL: 'https://z8qzoeztpc.execute-api.us-east-1.amazonaws.com/prod/',  // Assurez-vous que cette URL est correcte
});

api.interceptors.request.use(async (config) => {
  try {
    const session = await fetchAuthSession();
    const token = session.tokens?.idToken?.toString();
    if (token) {
      config.headers['Authorization'] = token;
    }
  } catch (error) {
    console.error('Error fetching auth session:', error);
  }
  return config;
}, (error) => Promise.reject(error));

export default api;