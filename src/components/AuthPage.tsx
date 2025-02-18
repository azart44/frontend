import React from 'react';
import { Authenticator, useAuthenticator, TextField, View } from '@aws-amplify/ui-react';
import { useNavigate } from 'react-router-dom';

function AuthPage() {
  const navigate = useNavigate();
  const { route } = useAuthenticator((context) => [context.route]);

  React.useEffect(() => {
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
                    isRequired={true}
                  />
                  <TextField
                    label="Full Name"
                    name="name"
                    placeholder="Enter your full name"
                    type="text"
                    isRequired={true}
                  />
                </>
              );
            },
          },
        }}
      />
    </View>
  );
}

export default AuthPage;