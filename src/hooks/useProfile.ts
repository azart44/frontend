import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getMyProfile, getProfileById, updateProfile } from '../api/profile';
import { UserProfile } from '../types/ProfileTypes';

// Clés de cache pour React Query
export const profileKeys = {
  all: ['profiles'] as const,
  profile: (id: string) => [...profileKeys.all, id] as const,
  myProfile: () => [...profileKeys.all, 'me'] as const,
};

/**
 * Hook pour récupérer le profil de l'utilisateur connecté
 */
export const useMyProfile = () => {
  return useQuery({
    queryKey: profileKeys.myProfile(),
    queryFn: () => getMyProfile().then(response => response.data),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
};

/**
 * Hook pour récupérer le profil d'un utilisateur par ID
 */
export const useUserProfile = (userId?: string) => {
  return useQuery({
    queryKey: profileKeys.profile(userId || 'unknown'),
    queryFn: () => getProfileById(userId!).then(response => response.data),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!userId, // Désactive la requête si userId est undefined
  });
};

/**
 * Hook pour mettre à jour un profil utilisateur
 */
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (profileData: Partial<UserProfile>) => updateProfile(profileData),
    onSuccess: (response, variables) => {
      // Mise à jour du cache
      queryClient.setQueryData(
        profileKeys.myProfile(), 
        response.data.updatedProfile
      );
      
      // Invalider les requêtes potentiellement affectées
      queryClient.invalidateQueries({
        queryKey: profileKeys.profile(response.data.updatedProfile.userId),
      });
    },
  });
};