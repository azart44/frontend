import { useState } from 'react';
import axios from 'axios';
import { fetchAuthSession } from 'aws-amplify/auth';

export const useApi = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const callApi = async (url: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const session = await fetchAuthSession();
      const token = session.tokens?.idToken?.toString();

      if (!token) {
        throw new Error('No ID token available');
      }

      const response = await axios.get(url, {
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json'
        },
        withCredentials: true
      });

      return response.data;
    } catch (error) {
      console.error('Error calling API:', error);
      if (axios.isAxiosError(error) && error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
      }
      setError('Error calling API: ' + (error instanceof Error ? error.message : String(error)));
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return { callApi, isLoading, error };
};