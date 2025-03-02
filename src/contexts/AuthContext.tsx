import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useAuthenticator } from '@aws-amplify/ui-react';
import { fetchUserAttributes } from 'aws-amplify/auth';

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  isProfileComplete: boolean;
  userId: string | null;
  userEmail: string | null;
}

interface AuthContextType extends AuthState {
  refreshAuth: () => Promise<void>;
}

const initialState: AuthState = {
  isAuthenticated: false,
  isLoading: true,
  isProfileComplete: false,
  userId: null,
  userEmail: null,
};

const AuthContext = createContext<AuthContextType>({
  ...initialState,
  refreshAuth: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { authStatus, user } = useAuthenticator((context) => [
    context.authStatus,
    context.user,
  ]);
  
  const [state, setState] = useState<AuthState>(initialState);
  
  const refreshAuth = useCallback(async () => {
    if (authStatus === 'authenticated' && user) {
      try {
        const attributes = await fetchUserAttributes();
        setState({
          isAuthenticated: true,
          isLoading: false,
          isProfileComplete: attributes['custom:profileCompleted'] === 'true',
          // Important: utilisez attributes.sub comme userId car c'est l'UUID utilisé dans DynamoDB
          userId: attributes.sub || null,
          userEmail: attributes.email || null,
        });
      } catch (error) {
        console.error('Erreur lors de la récupération des attributs:', error);
        setState({
          isAuthenticated: true,
          isLoading: false,
          isProfileComplete: false,
          userId: null,
          userEmail: null,
        });
      }
    } else {
      setState({
        isAuthenticated: false,
        isLoading: authStatus === 'configuring',
        isProfileComplete: false,
        userId: null,
        userEmail: null,
      });
    }
  }, [authStatus, user]);
  
  useEffect(() => {
    refreshAuth();
  }, [refreshAuth]);
  
  const contextValue = useMemo(() => ({
    ...state,
    refreshAuth,
  }), [state, refreshAuth]);
  
  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);