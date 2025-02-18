import React, { useEffect, useState } from 'react';
import { useAuthenticator, View, Heading, Text, Button, Loader } from '@aws-amplify/ui-react';
import { Navigate } from 'react-router-dom';
import { fetchUserAttributes, getCurrentUser, fetchAuthSession } from 'aws-amplify/auth';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

function Profile() {
  const { user } = useAuthenticator((context) => [context.user]);
  const { isAuthenticated } = useAuth();
  const [email, setEmail] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [apiResponse, setApiResponse] = useState<string | null>(null);

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
    try {
      const session = await fetchAuthSession();
      const token = session.tokens?.accessToken?.toString();
  
      if (!token) {
        throw new Error('No access token available');
      }
  
      const response = await axios.get('https://r80w1ax6u0.execute-api.us-east-1.amazonaws.com/prod/hello', {
        headers: {
          Authorization: `Bearer \${token}`
        }
      });
  
      setApiResponse(response.data);
    } catch (error) {
      console.error('Error calling API:', error);
      setApiResponse('Error calling API');
    }
  };

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <View padding="1rem">
      <Heading level={1}>Profile Page</Heading>
      <Text>Username: {user?.username}</Text>
      {isLoading ? (
        <Loader variation="linear" />
      ) : (
        <Text>Email: {email}</Text>
      )}
      <Button onClick={handleApiCall} marginTop="1rem">
        Call API
      </Button>
      {apiResponse && (
        <View marginTop="1rem">
          <Text>API Response:</Text>
          <pre>{JSON.stringify(apiResponse, null, 2)}</pre>
        </View>
      )}
    </View>
  );
}

export default Profile;