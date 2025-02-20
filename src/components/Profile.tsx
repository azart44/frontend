import React, { useEffect, useState } from 'react';
import { useAuthenticator, View, Heading, Text, Button, Loader } from '@aws-amplify/ui-react';
import { Navigate } from 'react-router-dom';
import { fetchUserAttributes } from 'aws-amplify/auth';
import { useAuth } from '../contexts/AuthContext';
import { useApi } from '../hooks/useApi';

function Profile() {
  const { user } = useAuthenticator((context) => [context.user]);
  const { isAuthenticated } = useAuth();
  const [email, setEmail] = useState<string | null>(null);
  const [userLoading, setUserLoading] = useState(false);
  const [apiResponse, setApiResponse] = useState<string | null>(null);
  const { callApi, isLoading, error } = useApi();

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
    const data = await callApi('helloworld');
    if (data) {
      setApiResponse(JSON.stringify(data, null, 2));
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
}

export default Profile;