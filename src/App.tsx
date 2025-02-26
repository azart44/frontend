import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import { AuthProvider } from './contexts/AuthContext';
import { useAuth } from './contexts/AuthContext';
import Header from './components/Header';

// Lazy load components
const Home = lazy(() => import('./components/Home'));
const Profile = lazy(() => import('./components/Profile'));
const AuthPage = lazy(() => import('./components/AuthPage'));
const CompleteProfile = lazy(() => import('./components/CompleteProfile'));
const UserList = lazy(() => import('./components/UserList'));
const AddTrack = lazy(() => import('./components/AddTrack')); // Nouveau composant

// Loading component
const Loading = () => <div>Loading...</div>;

// Layout component
const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div>
    <Header />
    {children}
  </div>
);

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return <Loading />;
  }
  
  return isAuthenticated ? <>{children}</> : <Navigate to="/auth" replace />;
};

function App() {
  return (
    <Authenticator.Provider>
      <AuthProvider>
        <Router>
          <Layout>
            <Suspense fallback={<Loading />}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/auth" element={<AuthPage />} />
                <Route path="/profile" element={
                  <PrivateRoute>
                    <Profile />
                  </PrivateRoute>
                } />
                <Route path="/profile/:userId" element={<Profile />} />
                <Route path="/complete-profile" element={
                  <PrivateRoute>
                    <CompleteProfile />
                  </PrivateRoute>
                } />
                <Route path="/users" element={
                  <PrivateRoute>
                    <UserList />
                  </PrivateRoute>
                } />
                <Route path="/add-track" element={ // Nouvelle route
                  <PrivateRoute>
                    <AddTrack />
                  </PrivateRoute>
                } />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
          </Layout>
        </Router>
      </AuthProvider>
    </Authenticator.Provider>
  );
}

export default App;