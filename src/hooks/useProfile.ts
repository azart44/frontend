import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as ProfileAPI from '../api/profile';
import { UserProfile } from '../types/ProfileTypes';
import { useAuth } from '../contexts/AuthContext';

// Clés de cache pour React Query
const profileKeys = {
  all: ['profile'] as const,
  profile: (userId: string | undefined) => [...profileKeys.all, userId] as const,
  search: (term: string) => [...profileKeys.all, 'search', term] as const,
  list: (filter?: string) => [...profileKeys.all, 'list', filter || 'all'] as const
};

/**
 * Hook pour récupérer un profil utilisateur
 * @param userId ID utilisateur (optionnel, utilise l'ID de l'utilisateur authentifié par défaut)
 */
export const useUserProfile = (userId?: string | null) => {
  const { userId: authUserId, updateLocalProfile } = useAuth();
  
  // Utilisez l'ID fourni ou l'ID de l'utilisateur authentifié, avec conversion en undefined si null
  const targetUserId = userId || authUserId || undefined;

  return useQuery({
    queryKey: profileKeys.profile(targetUserId),
    queryFn: async () => {
      if (!targetUserId) {
        throw new Error('Aucun identifiant utilisateur disponible');
      }

      try {
        console.log('Récupération du profil avec userId:', targetUserId);
        const response = targetUserId === authUserId
          ? await ProfileAPI.getMyProfile()
          : await ProfileAPI.getProfileById(targetUserId);
        
        // Si c'est le profil de l'utilisateur courant, mettre à jour également dans le contexte
        if (targetUserId === authUserId && updateLocalProfile) {
          updateLocalProfile(response.data);
        }
        
        return response.data;
      } catch (error: any) {
        console.error('Erreur de récupération du profil:', error);
        
        if (error.response?.status === 404) {
          console.log('Profil non trouvé, retourne null');
          return null; // Profil non trouvé
        }
        
        throw error;
      }
    },
    retry: (failureCount, error: any) => {
      // Ne pas réessayer pour les erreurs 404
      if (error.response?.status === 404) return false;
      // Limiter à 2 tentatives pour les autres erreurs
      return failureCount < 2;
    },
    enabled: !!targetUserId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Hook pour rechercher des profils
 */
export const useSearchProfiles = (searchTerm: string, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: profileKeys.search(searchTerm),
    queryFn: async () => {
      if (!searchTerm || searchTerm.length < 2) {
        return [];
      }
      
      const response = await ProfileAPI.searchProfiles(searchTerm);
      return response.data;
    },
    enabled: !!searchTerm && searchTerm.length >= 2 && (options?.enabled !== false),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

/**
 * Hook pour lister tous les utilisateurs avec filtres optionnels
 */
export const useListProfiles = (filters?: Record<string, string>) => {
  return useQuery({
    queryKey: profileKeys.list(JSON.stringify(filters)),
    queryFn: async () => {
      const response = await ProfileAPI.getAllUsers(filters);
      return response.data;
    },
    staleTime: 5 * 60 * 1000 // 5 minutes
  });
};

/**
 * Hook pour mettre à jour un profil
 */
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  const { userId: authUserId, updateLocalProfile } = useAuth();

  return useMutation({
    mutationFn: async (profileData: Partial<UserProfile>) => {
      // S'assurer que userId est correctement défini (non null)
      const cleanProfileData = {
        ...profileData,
        userId: profileData.userId || authUserId || undefined
      };
      
      console.log('Mise à jour du profil avec les données:', cleanProfileData);
      const response = await ProfileAPI.updateProfile(cleanProfileData);
      
      // Mettre à jour le profil local dans le contexte
      if (updateLocalProfile && response.data && response.data.updatedProfile) {
        updateLocalProfile(response.data.updatedProfile);
      }
      
      return response.data;
    },
    onSuccess: (data, variables) => {
      console.log('Profil mis à jour avec succès:', data);
      
      // Invalider les requêtes correspondantes
      const targetUserId = variables.userId || authUserId;
      
      if (targetUserId) {
        queryClient.invalidateQueries({ 
          queryKey: profileKeys.profile(targetUserId),
        });
      }
      
      // Invalider également la liste des utilisateurs si nécessaire
      queryClient.invalidateQueries({ 
        queryKey: profileKeys.list(),
      });
      
      return data;
    },
    onError: (error: any) => {
      console.error('Erreur lors de la mise à jour du profil:', error);
      throw error;
    }
  });
};