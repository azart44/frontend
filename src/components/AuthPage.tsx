import React, { useEffect } from 'react';
import { Authenticator, useAuthenticator, TextField, View } from '@aws-amplify/ui-react';
import { useNavigate } from 'react-router-dom';

const AuthPage: React.FC = () => {
  const navigate = useNavigate();
  const { route } = useAuthenticator((context) => [context.route]);

  useEffect(() => {
    if (route === 'authenticated') {
      navigate('/profile');
    }
  }, [route, navigate]);

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
};

export default AuthPage;