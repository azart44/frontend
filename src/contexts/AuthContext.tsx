import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import { useAuthenticator } from '@aws-amplify/ui-react';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({ isAuthenticated: false, isLoading: true });

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { authStatus } = useAuthenticator((context) => [context.authStatus]);
  const [state, setState] = useState<AuthContextType>({ isAuthenticated: false, isLoading: true });

  useEffect(() => {
    setState({
      isAuthenticated: authStatus === 'authenticated',
      isLoading: authStatus === 'configuring'
    });
  }, [authStatus]);

  const value = useMemo(() => state, [state]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);