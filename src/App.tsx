import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import { AuthProvider } from './contexts/AuthContext';
import { AudioProvider } from './contexts/AudioContext';
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
const AccountSettings = lazy(() => import('./components/account/AccountSettings'));
// Ajouter le composant Favorites
const Favorites = lazy(() => import('./components/favorites/Favorites'));
// Ajouter les composants pour les playlists
const PlaylistList = lazy(() => import('./components/playlist/PlaylistList'));
const PlaylistDetail = lazy(() => import('./components/playlist/PlaylistDetail'));
const PlaylistForm = lazy(() => import('./components/playlist/PlaylistForm'));

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
          <AudioProvider>
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
                    <Route 
                      path="/account-settings" 
                      element={
                        <ProfileCompletionRoute>
                          <AccountSettings />
                        </ProfileCompletionRoute>
                      } 
                    />
                    
                    {/* Ajout de la route pour les favoris */}
                    <Route 
                      path="/favorites" 
                      element={
                        <ProfileCompletionRoute>
                          <Favorites />
                        </ProfileCompletionRoute>
                      } 
                    />
                    
                    {/* Routes pour les playlists */}
                    <Route path="/playlists">
                      <Route 
                        index
                        element={
                          <ProfileCompletionRoute>
                            <PlaylistList />
                          </ProfileCompletionRoute>
                        } 
                      />
                      <Route 
                        path="new" 
                        element={
                          <ProfileCompletionRoute>
                            <PlaylistForm />
                          </ProfileCompletionRoute>
                        } 
                      />
                      <Route path=":playlistId" element={<PlaylistDetail />} />
                    </Route>
                    
                    {/* Fallback pour les routes inconnues */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </Suspense>
              </ChordoraLayout>
            </Router>
          </AudioProvider>
        </AuthProvider>
      </Authenticator.Provider>
    </QueryClientProvider>
  );
}

export default App;