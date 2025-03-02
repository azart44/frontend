import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthenticator } from '@aws-amplify/ui-react';
import { fetchUserAttributes } from 'aws-amplify/auth';
import apiClient from '../api';
import { UserProfile } from '../types/ProfileTypes';
import { useState, useEffect } from 'react';

export const useUserProfile = (userId?: string | null) => {
  const { user } = useAuthenticator((context) => [context.user]);
  const [cognitoUserId, setCognitoUserId] = useState<string | null>(null);

  // Récupérer l'ID utilisateur de Cognito
  useEffect(() => {
    const getUserId = async () => {
      try {
        const attributes = await fetchUserAttributes();
        // Vérification explicite pour éviter les undefined
        if (attributes.sub) {
          setCognitoUserId(attributes.sub);
        }
      } catch (error) {
        console.error('Erreur de récupération des attributs utilisateur:', error);
      }
    };

    getUserId();
  }, [user]);

  return useQuery({
    queryKey: [
      'profile', 
      userId || 
      (user?.attributes?.sub ?? null) || 
      cognitoUserId
    ],
    queryFn: async () => {
      // Utiliser l'userId fourni ou l'ID Cognito (sub)
      const targetUserId = userId || 
        (user?.attributes?.sub ?? null) || 
        cognitoUserId;

      if (!targetUserId) {
        throw new Error('Aucun identifiant utilisateur disponible');
      }

      try {
        console.log('Récupération du profil avec userId:', targetUserId);
        const response = await apiClient.get<UserProfile>(`/user-profile/${targetUserId}`);
        return response.data;
      } catch (error: any) {
        console.error('Erreur de récupération du profil:', error);
        if (error.response?.status === 404) {
          return null; // Profil non trouvé
        }
        throw error;
      }
    },
    retry: 1,
    enabled: !!userId || 
             !!(user?.attributes?.sub ?? null) || 
             !!cognitoUserId,
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (profileData: Partial<UserProfile>) => 
      apiClient.post('/user-profile', { profileData }),
    onSuccess: (response) => {
      // Mettre à jour le cache de requête
      queryClient.invalidateQueries({ 
        queryKey: ['profile'],
        refetchType: 'active'
      });
      return response.data;
    },
  });
};