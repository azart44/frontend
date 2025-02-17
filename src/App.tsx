import React from 'react';
import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import { signInWithRedirect } from "aws-amplify/auth";
import { Button } from '@aws-amplify/ui-react';

function App() {
  const handleSignIn = () => {
    signInWithRedirect();
  };

  return (
    <Authenticator>
      {({ signOut, user }) => (
        <div>
          {user ? (
            <>
              <h1>Hello {user.username}</h1>
              <Button onClick={signOut}>Sign out</Button>
            </>
          ) : (
            <Button onClick={handleSignIn}>Sign in with Cognito</Button>
          )}
        </div>
      )}
    </Authenticator>
  );
}

export default App;
