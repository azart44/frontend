import React, { useEffect } from 'react';
import { Authenticator, useAuthenticator, TextField, View } from '@aws-amplify/ui-react';
import { useNavigate } from 'react-router-dom';
import { fetchUserAttributes } from 'aws-amplify/auth';

const useProfileCompletion = (authStatus: string, navigate: (path: string) => void) => {
  useEffect(() => {
    const checkProfileCompletion = async () => {
      if (authStatus === 'authenticated') {
        try {
          const attributes = await fetchUserAttributes();
          if (attributes['custom:profileCompleted'] === 'true') {
            navigate('/');
          } else {
            navigate('/complete-profile');
          }
        } catch (error) {
          console.error('Error fetching user attributes:', error);
          navigate('/complete-profile');
        }
      }
    };

    checkProfileCompletion();
  }, [authStatus, navigate]);
};

const AuthPage: React.FC = React.memo(() => {
  const navigate = useNavigate();
  const { authStatus } = useAuthenticator((context) => [context.authStatus]);
  
  useProfileCompletion(authStatus, navigate);

  return (
    <View>
      <Authenticator
        components={{
          SignUp: {
            FormFields() {
              return (
                <>
                  <Authenticator.SignUp.FormFields />
                  <TextField
                    label="Email"
                    name="email"
                    placeholder="Enter your email"
                    type="email"
                    isRequired
                  />
                  <TextField
                    label="Full Name"
                    name="name"
                    placeholder="Enter your full name"
                    type="text"
                    isRequired
                  />
                </>
              );
            },
          },
        }}
      />
    </View>
  );
});

export default AuthPage;