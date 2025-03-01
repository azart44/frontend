import { useQuery } from '@tanstack/react-query';
import { getUserProfile, getUserProfileById, getTracks } from '../utils/api';
import { UserProfile } from '../types/ProfileTypes';

export const useUserProfile = (userId?: string) => {
  const queryKey = userId ? ['userProfile', userId] : ['userProfile'];
  const queryFn = userId 
    ? () => getUserProfileById(userId).then(response => response.data as UserProfile)
    : () => getUserProfile().then(response => response.data as UserProfile);

  return useQuery<UserProfile>({
    queryKey,
    queryFn,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (replaces cacheTime)
    enabled: !!userId || true, // Always fetch if logged in
  });
};

export const useUserTracks = (userId: string) => {
  return useQuery({
    queryKey: ['tracks', userId],
    queryFn: () => getTracks(userId).then(response => response.data),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000, // replaces cacheTime
    enabled: !!userId,
  });
};