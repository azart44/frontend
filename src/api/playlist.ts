import apiClient from './index';
import { Playlist, PlaylistFormData, PlaylistsResponse, PlaylistResponse, DeletePlaylistResponse } from '../types/PlaylistTypes';

/**
 * Récupère toutes les playlists d'un utilisateur
 * @param userId ID utilisateur optionnel (utilise l'utilisateur authentifié par défaut)
 * @returns Promise avec la liste des playlists
 */
export const getUserPlaylists = (userId?: string) => {
  const params = userId ? { userId } : {};
  return apiClient.get<PlaylistsResponse>('/playlists', { params });
};

/**
 * Récupère une playlist spécifique par son ID
 * @param playlistId ID de la playlist
 * @returns Promise avec les détails de la playlist et ses pistes
 */
export const getPlaylistById = (playlistId: string) => 
  apiClient.get<Playlist>(`/playlists/${playlistId}`);

/**
 * Crée une nouvelle playlist
 * @param playlistData Données de la playlist à créer
 * @returns Promise avec la playlist créée
 */
export const createPlaylist = (playlistData: PlaylistFormData) => 
  apiClient.post<PlaylistResponse>('/playlists', playlistData);

/**
 * Met à jour une playlist existante
 * @param playlistData Données à mettre à jour
 * @returns Promise avec la playlist mise à jour
 */
export const updatePlaylist = (playlistData: PlaylistFormData) => 
  apiClient.put<PlaylistResponse>('/playlists', playlistData);

/**
 * Supprime une playlist
 * @param playlistId ID de la playlist à supprimer
 * @returns Promise avec le résultat de la suppression
 */
export const deletePlaylist = (playlistId: string) => 
  apiClient.delete<DeletePlaylistResponse>(`/playlists/${playlistId}`);