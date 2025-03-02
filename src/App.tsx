import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import { AuthProvider } from './contexts/AuthContext';
import { useAuth } from './contexts/AuthContext';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './utils/queryClient';
import ChordoraLayout from './components/layout/ChordoraLayout';
import './ChordoraTheme.css';

// Lazy load components pour améliorer les performances
const Home = lazy(() => import('./components/Home'));
const Profile = lazy(() => import('./components/profile/Profile'));
const AuthPage = lazy(() => import('./components/auth/AuthPage'));
const CompleteProfile = lazy(() => import('./components/profile/CompleteProfile'));
const UserList = lazy(() => import('./components/user/UserList'));
const TrackUpload = lazy(() => import('./components/track/TrackUpload'));

// Composant de chargement réutilisable avec spinner
const Loading = () => (
  <div className="loading-container">
    <div className="loading-spinner"></div>
    <p>Chargement...</p>
  </div>
);

// Route privée qui nécessite une authentification
const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return <Loading />;
  }
  
  return isAuthenticated ? <>{children}</> : <Navigate to="/auth" replace />;
};

// Protected complete profile route
const ProfileCompletionRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isProfileComplete, isLoading } = useAuth();
  
  if (isLoading) {
    return <Loading />;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }
  
  if (!isProfileComplete) {
    return <Navigate to="/complete-profile" replace />;
  }
  
  return <>{children}</>;
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Authenticator.Provider>
        <AuthProvider>
          <Router>
            <ChordoraLayout>
              <Suspense fallback={<Loading />}>
                <Routes>
                  {/* Routes publiques */}
                  <Route path="/" element={<Home />} />
                  <Route path="/auth" element={<AuthPage />} />
                  <Route path="/profile/:userId" element={<Profile />} />
                  
                  {/* Routes qui nécessitent une authentification */}
                  <Route 
                    path="/complete-profile" 
                    element={
                      <PrivateRoute>
                        <CompleteProfile />
                      </PrivateRoute>
                    } 
                  />
                  
                  {/* Routes qui nécessitent un profil complet */}
                  <Route 
                    path="/profile" 
                    element={
                      <ProfileCompletionRoute>
                        <Profile />
                      </ProfileCompletionRoute>
                    } 
                  />
                  <Route 
                    path="/users" 
                    element={
                      <ProfileCompletionRoute>
                        <UserList />
                      </ProfileCompletionRoute>
                    } 
                  />
                  <Route 
                    path="/add-track" 
                    element={
                      <ProfileCompletionRoute>
                        <TrackUpload />
                      </ProfileCompletionRoute>
                    } 
                  />
                  
                  {/* Fallback pour les routes inconnues */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </Suspense>
            </ChordoraLayout>
          </Router>
        </AuthProvider>
      </Authenticator.Provider>
    </QueryClientProvider>
  );
}

export default App;