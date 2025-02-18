import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuthenticator } from '@aws-amplify/ui-react';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({ isAuthenticated: false, isLoading: true });

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { authStatus } = useAuthenticator((context) => [context.authStatus]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (authStatus === 'authenticated') {
      setIsAuthenticated(true);
      setIsLoading(false);
    } else if (authStatus === 'unauthenticated') {
      setIsAuthenticated(false);
      setIsLoading(false);
    } else {
      setIsLoading(true);
    }
  }, [authStatus]);

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);