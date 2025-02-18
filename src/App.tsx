import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import { AuthProvider } from './contexts/AuthContext';
import Header from './components/Header';
import LandingPage from './components/LandingPage';
import Profile from './components/Profile';
import AuthPage from './components/AuthPage';

function App() {
  return (
    <Authenticator.Provider>
      <AuthProvider>
        <Router>
          <div>
            <Header />
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/profile" element={<Profile />} />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </Authenticator.Provider>
  );
}

export default App;