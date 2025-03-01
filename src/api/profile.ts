import apiClient from './index';
import { UserProfile } from '../types/ProfileTypes';

export const getMyProfile = () => 
  apiClient.get<UserProfile>('/user-profile');

export const getProfileById = (userId: string) => 
  apiClient.get<UserProfile>(`/user-profile/${userId}`);

export const updateProfile = (profileData: Partial<UserProfile>) => 
  apiClient.post<{updatedProfile: UserProfile}>('/user-profile', { profileData });

export const searchProfiles = (searchTerm: string) => 
  apiClient.get(`/search-profiles?term=${encodeURIComponent(searchTerm)}`);

export const getAllUsers = () => 
  apiClient.get('/get-all-users');