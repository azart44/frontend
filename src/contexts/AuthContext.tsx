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
import { UserProfile } from '../types/ProfileTypes';

// Interface définissant la structure de l'état d'authentification
interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  isProfileComplete: boolean;
  userId: string | null;
  userEmail: string | null;
  userProfile: UserProfile | null;
  error: string | null;
}

// Interface étendant l'état avec des méthodes
interface AuthContextType extends AuthState {
  refreshAuth: () => Promise<void>;
  logout: () => Promise<void>;
  updateLocalProfile: (profile: Partial<UserProfile>) => void;
}

// État initial par défaut
const initialState: AuthState = {
  isAuthenticated: false,
  isLoading: true,
  isProfileComplete: false,
  userId: null,
  userEmail: null,
  userProfile: null,
  error: null
};

// Création du contexte d'authentification
const AuthContext = createContext<AuthContextType>({
  ...initialState,
  refreshAuth: async () => {},
  logout: async () => {},
  updateLocalProfile: () => {}
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
      setState(prev => ({ ...prev, error: 'Erreur lors de la déconnexion' }));
    }
  }, [signOut]);

  // Méthode pour mettre à jour le profil localement sans appel API
  const updateLocalProfile = useCallback((profile: Partial<UserProfile>) => {
    setState(prev => ({
      ...prev,
      userProfile: prev.userProfile ? { ...prev.userProfile, ...profile } : null,
      isProfileComplete: profile.profileCompleted ?? prev.isProfileComplete
    }));
  }, []);

  // Méthode pour actualiser l'état d'authentification
  const refreshAuth = useCallback(async () => {
    // Réinitialiser l'état de chargement
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    // Vérifier si l'utilisateur est authentifié
    if (authStatus === 'authenticated' && user) {
      try {
        // Récupérer les attributs de l'utilisateur
        const attributes = await fetchUserAttributes();
        
        // Récupérer l'ID de session pour s'assurer que le token est valide
        const session = await fetchAuthSession();
        const userId = attributes.sub || user.username;

        if (!userId) {
          throw new Error('ID utilisateur non disponible');
        }

        // Récupérer le profil complet depuis l'API
        try {
          const response = await api.get(`/user-profile/${userId}`);
          const profileData = response.data;

          // Mettre à jour l'état avec le profil complet
          setState({
            isAuthenticated: true,
            isLoading: false,
            isProfileComplete: profileData?.profileCompleted === true || attributes['custom:profileCompleted'] === 'true',
            userId,
            userEmail: attributes.email || null,
            userProfile: profileData || null,
            error: null
          });
        } catch (apiError: any) {
          console.warn('Erreur lors de la récupération du profil:', apiError);
          
          // Même en cas d'erreur API, considérer l'utilisateur authentifié
          // mais avec un profil incomplet ou inexistant
          setState({
            isAuthenticated: true,
            isLoading: false,
            isProfileComplete: attributes['custom:profileCompleted'] === 'true',
            userId,
            userEmail: attributes.email || null,
            userProfile: null,
            error: apiError.message || 'Erreur lors de la récupération du profil'
          });
        }
      } catch (error: any) {
        console.error('Erreur lors de l\'authentification:', error);
        
        // En cas d'erreur, réinitialiser l'état mais garder l'erreur
        setState({
          ...initialState,
          isLoading: false,
          error: error.message || 'Erreur lors de l\'authentification'
        });
      }
    } else {
      // Si non authentifié, réinitialiser l'état
      setState({
        ...initialState,
        isLoading: authStatus === 'configuring'
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
    logout,
    updateLocalProfile
  }), [state, refreshAuth, logout, updateLocalProfile]);

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