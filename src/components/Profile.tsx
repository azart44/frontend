import React, { useEffect, useState } from 'react';
import { useAuthenticator, View, Heading, Text, Button, Loader } from '@aws-amplify/ui-react';
import { Navigate } from 'react-router-dom';
import { fetchUserAttributes } from 'aws-amplify/auth';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';

const Profile: React.FC = () => {
  const { user } = useAuthenticator((context) => [context.user]);
  const { isAuthenticated } = useAuth();
  const [email, setEmail] = useState<string | null>(null);
  const [userLoading, setUserLoading] = useState(false);
  const [apiResponse, setApiResponse] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getUserAttributes = async () => {
      if (user) {
        try {
          setUserLoading(true);
          const attributes = await fetchUserAttributes();
          setEmail(attributes.email || 'N/A');
        } catch (error) {
          console.error('Error fetching user attributes:', error);
          setEmail('Error fetching email');
        } finally {
          setUserLoading(false);
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
      const response = await api.get('/helloworld');  // Assurez-vous que ce chemin est correct
      setApiResponse(JSON.stringify(response.data, null, 2));
    } catch (error) {
      console.error('Error calling API:', error);
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
      <Text>Email: {userLoading ? 'Loading...' : email}</Text>
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
      {(isLoading || userLoading) && <Loader variation="linear" />}
    </View>
  );
};

export default Profile;