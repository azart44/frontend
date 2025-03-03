import apiClient from './index';
import { UserProfile } from '../types/ProfileTypes';

/**
 * Récupère le profil de l'utilisateur actuellement authentifié
 * @returns Promise avec les données du profil
 */
export const getMyProfile = () => 
  apiClient.get<UserProfile>('/user-profile');

/**
 * Récupère le profil d'un utilisateur par son ID
 * @param userId ID de l'utilisateur
 * @returns Promise avec les données du profil
 */
export const getProfileById = (userId: string) => 
  apiClient.get<UserProfile>(`/user-profile/${userId}`);

/**
 * Met à jour le profil de l'utilisateur
 * @param profileData Données du profil à mettre à jour
 * @returns Promise avec le profil mis à jour
 */
export const updateProfile = (profileData: Partial<UserProfile>) => 
  apiClient.post<{updatedProfile: UserProfile}>('/user-profile', { profileData });

/**
 * Recherche des profils par terme
 * @param searchTerm Terme de recherche
 * @returns Promise avec les résultats de recherche
 */
export const searchProfiles = (searchTerm: string) => 
  apiClient.get(`/search-profiles?term=${encodeURIComponent(searchTerm)}`);

/**
 * Récupère tous les utilisateurs
 * @param filters Filtres optionnels (userType, genre, etc.)
 * @returns Promise avec la liste des utilisateurs
 */
export const getAllUsers = (filters?: Record<string, string>) => {
  let queryString = '';
  if (filters) {
    queryString = Object.entries(filters)
      .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
      .join('&');
    if (queryString) {
      queryString = `?${queryString}`;
    }
  }
  return apiClient.get(`/get-all-users${queryString}`);
};