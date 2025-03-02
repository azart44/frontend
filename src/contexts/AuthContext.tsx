import React, { 
  createContext, 
  useContext, 
  useState, 
  useEffect, 
  useCallback, 
  useMemo 
} from 'react';
import { useAuthenticator } from '@aws-amplify/ui-react';
import { 
  fetchUserAttributes, 
  fetchAuthSession 
} from 'aws-amplify/auth';
import api from '../api';

// Interface définissant la structure de l'état d'authentification
interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  isProfileComplete: boolean;
  userId: string | null;
  userEmail: string | null;
  userRole?: string;
}

// Interface étendant l'état avec des méthodes
interface AuthContextType extends AuthState {
  refreshAuth: () => Promise<void>;
  logout: () => Promise<void>;
}

// État initial par défaut
const initialState: AuthState = {
  isAuthenticated: false,
  isLoading: true,
  isProfileComplete: false,
  userId: null,
  userEmail: null,
  userRole: undefined
};

// Création du contexte d'authentification
const AuthContext = createContext<AuthContextType>({
  ...initialState,
  refreshAuth: async () => {},
  logout: async () => {}
});

// Composant Provider pour le contexte d'authentification
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Utiliser le hook d'authentification d'Amplify
  const { authStatus, user, signOut } = useAuthenticator((context) => [
    context.authStatus,
    context.user,
    context.signOut
  ]);

  // État local pour gérer l'authentification
  const [state, setState] = useState<AuthState>(initialState);

  // Méthode de déconnexion
  const logout = useCallback(async () => {
    try {
      await signOut();
      setState(initialState);
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  }, [signOut]);

  // Méthode pour actualiser l'état d'authentification
  const refreshAuth = useCallback(async () => {
    // Réinitialiser l'état de chargement
    setState(prev => ({ ...prev, isLoading: true }));

    // Vérifier si l'utilisateur est authentifié
    if (authStatus === 'authenticated' && user) {
      try {
        // Récupérer les attributs de l'utilisateur
        const attributes = await fetchUserAttributes();
        
        // Récupérer l'ID de session
        await fetchAuthSession();

        // Vérifier l'existence et la complétude du profil via l'API
        let profileData = null;
        try {
          const userId = attributes.sub || user.username;
          const response = await api.get(`/user-profile/${userId}`);
          profileData = response.data;
        } catch (apiError: any) {
          console.warn('Erreur lors de la récupération du profil:', apiError);
        }

        // Mettre à jour l'état avec les informations récupérées
        setState({
          isAuthenticated: true,
          isLoading: false,
          // Vérifier si le profil est complété via l'API ou les attributs Cognito
          isProfileComplete: 
            profileData?.profileCompleted === true || 
            attributes['custom:profileCompleted'] === 'true',
          userId: attributes.sub || user.username || null,
          userEmail: attributes.email || null,
          userRole: profileData?.userType || attributes['custom:userType']
        });
      } catch (error) {
        console.error('Erreur lors de l\'authentification:', error);
        
        // En cas d'erreur, réinitialiser l'état
        setState({
          isAuthenticated: false,
          isLoading: false,
          isProfileComplete: false,
          userId: null,
          userEmail: null,
          userRole: undefined
        });
      }
    } else {
      // Si non authentifié, réinitialiser l'état
      setState({
        isAuthenticated: false,
        isLoading: authStatus === 'configuring',
        isProfileComplete: false,
        userId: null,
        userEmail: null,
        userRole: undefined
      });
    }
  }, [authStatus, user]);

  // Actualiser l'authentification au montage et lors de changements
  useEffect(() => {
    refreshAuth();
  }, [refreshAuth]);

  // Mémoriser le contexte pour éviter des rendus inutiles
  const contextValue = useMemo(() => ({
    ...state,
    refreshAuth,
    logout
  }), [state, refreshAuth, logout]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook personnalisé pour utiliser le contexte d'authentification
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  // Vérifier que le hook est utilisé dans un AuthProvider
  if (context === undefined) {
    throw new Error('useAuth doit être utilisé au sein d\'un AuthProvider');
  }
  
  return context;
};