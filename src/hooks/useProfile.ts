import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api';
import { UserProfile } from '../types/ProfileTypes';
import { useAuth } from '../contexts/AuthContext';

export const useUserProfile = (userId?: string | null) => {
  const { userId: authUserId } = useAuth();
  
  // Utilisez l'ID fourni ou l'ID de l'utilisateur authentifié
  const targetUserId = userId || authUserId;

  return useQuery({
    queryKey: ['profile', targetUserId],
    queryFn: async () => {
      if (!targetUserId) {
        throw new Error('Aucun identifiant utilisateur disponible');
      }

      try {
        console.log('Récupération du profil avec userId:', targetUserId);
        const response = await apiClient.get<UserProfile>(`/user-profile/${targetUserId}`);
        return response.data;
      } catch (error: any) {
        console.error('Erreur de récupération du profil:', error);
        
        // Log plus détaillé de l'erreur pour le débogage
        if (error.response) {
          console.error('Détail de l\'erreur serveur:', {
            status: error.response.status,
            data: error.response.data,
            headers: error.response.headers
          });
        }
        
        if (error.response?.status === 404) {
          console.log('Profil non trouvé, retourne null');
          return null; // Profil non trouvé
        }
        
        // Pour les erreurs 500, on peut avoir un message plus détaillé dans la réponse
        if (error.response?.status === 500 && error.response?.data) {
          console.error('Erreur serveur détaillée:', error.response.data);
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
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  const { userId: authUserId } = useAuth();

  return useMutation({
    mutationFn: (profileData: Partial<UserProfile>) => {
      // S'assurer que userId est correctement défini
      const updatedProfileData = {
        ...profileData,
        userId: profileData.userId || authUserId
      };
      
      // Log les données avant envoi
      console.log('Mise à jour du profil avec les données:', updatedProfileData);
      
      return apiClient.post('/user-profile', { profileData: updatedProfileData });
    },
    onSuccess: (response) => {
      console.log('Profil mis à jour avec succès:', response.data);
      // Mettre à jour le cache de requête
      queryClient.invalidateQueries({ 
        queryKey: ['profile'],
        refetchType: 'active'
      });
      return response.data;
    },
    onError: (error: any) => {
      console.error('Erreur lors de la mise à jour du profil:', error);
      if (error.response) {
        console.error('Détail de l\'erreur serveur:', {
          status: error.response.status,
          data: error.response.data
        });
      }
      throw error;
    }
  });
};