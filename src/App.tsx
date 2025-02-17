import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import { Amplify } from 'aws-amplify';

import Home from './components/Home';
import Profile from './components/Profile';

Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: process.env.REACT_APP_USER_POOL_ID!,
      userPoolClientId: process.env.REACT_APP_USER_POOL_CLIENT_ID!,
      signUpVerificationMethod: 'code',
    }
  }
});

function App() {
  return (
    <Authenticator>
      {({ signOut, user }) => (
        <Router>
          <Routes>
            <Route path="/" element={<Home signOut={signOut} user={user} />} />
            <Route 
              path="/profile" 
              element={user ? <Profile user={user} /> : <Navigate to="/" replace />} 
            />
          </Routes>
        </Router>
      )}
    </Authenticator>
  );
}

export default App;