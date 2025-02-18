import React, { useEffect, useState } from 'react';
import { useAuthenticator, View, Heading, Text, Button, Loader } from '@aws-amplify/ui-react';
import { Navigate } from 'react-router-dom';
import { fetchUserAttributes, fetchAuthSession } from 'aws-amplify/auth';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

function Profile() {
  const { user } = useAuthenticator((context) => [context.user]);
  const { isAuthenticated } = useAuth();
  const [email, setEmail] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [apiResponse, setApiResponse] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getUserAttributes = async () => {
      if (user) {
        try {
          setIsLoading(true);
          const attributes = await fetchUserAttributes();
          setEmail(attributes.email || 'N/A');
        } catch (error) {
          console.error('Error fetching user attributes:', error);
          setEmail('Error fetching email');
        } finally {
          setIsLoading(false);
        }
      }
    };

    getUserAttributes();
  }, [user]);

  const handleApiCall = async () => {
    setIsLoading(true);
    setApiResponse(null);
    setError(null);
    try {
      const session = await fetchAuthSession();
      const token = session.tokens?.idToken?.toString(); // Changé pour utiliser idToken

      if (!token) {
        throw new Error('No ID token available');
      }

      console.log('Token:', token); // Pour le débogage

      const response = await axios.get('https://r80w1ax6u0.execute-api.us-east-1.amazonaws.com/prod/hello', {
        headers: {
          'Authorization': `${token}`, // Ajout de 'Bearer'
          'Content-Type': 'application/json'
        },
        withCredentials: true
      });

      console.log('API response:', response.data);
      setApiResponse(JSON.stringify(response.data, null, 2));
    } catch (error) {
      console.error('Error calling API:', error);
      if (axios.isAxiosError(error) && error.response) {
        // Log plus détaillé de l'erreur Axios
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
      }
      setError('Error calling API: ' + (error instanceof Error ? error.message : String(error)));
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <View padding="1rem">
      <Heading level={1}>Profile Page</Heading>
      <Text>Username: {user?.username}</Text>
      <Text>Email: {isLoading ? 'Loading...' : email}</Text>
      <Button onClick={handleApiCall} marginTop="1rem" isLoading={isLoading}>
        Call API
      </Button>
      {apiResponse && (
        <View marginTop="1rem">
          <Text>API Response:</Text>
          <pre>{apiResponse}</pre>
        </View>
      )}
      {error && (
        <View marginTop="1rem">
          <Text color="red">{error}</Text>
        </View>
      )}
      {isLoading && <Loader variation="linear" />}
    </View>
  );
}

export default Profile;