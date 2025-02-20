import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import { AuthProvider } from './contexts/AuthContext';
import Header from './components/Header';
import Home from './components/Home';
import Profile from './components/Profile';
import AuthPage from './components/AuthPage';
import CompleteProfile from './components/CompleteProfile';
import { useAuth } from './contexts/AuthContext';

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return <div>Loading...</div>;
  }
  
  return isAuthenticated ? <>{children}</> : <Navigate to="/auth" replace />;
};

function App() {
  return (
    <Authenticator.Provider>
      <AuthProvider>
        <Router>
          <div>
            <Header />
            <Routes>
              {/* La route Home n'est plus dans un PrivateRoute */}
              <Route path="/" element={<Home />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/profile" element={
                <PrivateRoute>
                  <Profile />
                </PrivateRoute>
              } />
              <Route path="/complete-profile" element={
                <PrivateRoute>
                  <CompleteProfile />
                </PrivateRoute>
              } />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </Authenticator.Provider>
  );
}

export default App;