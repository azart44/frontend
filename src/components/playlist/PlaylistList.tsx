import React, { useState, useCallback } from 'react';
import { 
  View, 
  Heading, 
  Text, 
  Flex, 
  Loader, 
  Card,
  Badge,
  Alert
} from '@aws-amplify/ui-react';
import { useNavigate } from 'react-router-dom';
import { FaPlus, FaMusic, FaList, FaEdit, FaTrash, FaLock, FaGlobe } from 'react-icons/fa';
import { useUserPlaylists, useDeletePlaylist } from '../../hooks/usePlaylists';
import { useAuth } from '../../contexts/AuthContext';
import ChordoraButton from '../common/ChordoraButton';

interface PlaylistListProps {
  userId?: string;
  showAddButton?: boolean;
  hideAddButton?: boolean; // Pour cacher explicitement le bouton
  onAddPlaylist?: () => void;
  onPlaylistClick?: (playlistId: string) => void;
}

/**
 * Composant pour afficher la liste des playlists d'un utilisateur
 */
const PlaylistList: React.FC<PlaylistListProps> = ({ 
  userId, 
  showAddButton = true,
  hideAddButton = false,
  onAddPlaylist,
  onPlaylistClick
}) => {
  const navigate = useNavigate();
  const { userId: authUserId } = useAuth();
  
  // Récupération des playlists
  const { 
    data, 
    isLoading, 
    error,
    refetch 
  } = useUserPlaylists(userId);
  
  // Hook pour supprimer une playlist
  const deletePlaylistMutation = useDeletePlaylist();
  
  // Gérer le clic sur une playlist
  const handlePlaylistClick = (playlistId: string) => {
    if (onPlaylistClick) {
      onPlaylistClick(playlistId);
    } else {
      // Navigation par défaut vers la page de détail
      navigate(`/playlists/${playlistId}`);
    }
  };
  
  // Gérer la suppression d'une playlist
  const handleDeletePlaylist = async (playlist: any, e: React.MouseEvent) => {
    e.stopPropagation(); // Éviter la propagation vers le parent
    
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer la playlist "${playlist.title}" ?`)) {
      try {
        await deletePlaylistMutation.mutateAsync(playlist.playlist_id);
        // La liste sera automatiquement rafraîchie grâce à l'invalidation des requêtes
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        alert('Une erreur est survenue lors de la suppression de la playlist.');
      }
    }
  };
  
  // Gérer l'édition d'une playlist
  const handleEditClick = (playlistId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/playlists/${playlistId}/edit`);
  };
  
  // Déterminer si l'utilisateur peut modifier les playlists
  const canEdit = userId === authUserId || !userId;
  
  // Créer une nouvelle playlist
  const handleCreatePlaylist = () => {
    if (onAddPlaylist) {
      onAddPlaylist();
    } else {
      navigate('/playlists/new');
    }
  };
  
  // Afficher un loader pendant le chargement
  if (isLoading) {
    return (
      <Flex justifyContent="center" padding="2rem">
        <div className="loading-spinner"></div>
      </Flex>
    );
  }
  
  // Afficher une erreur si nécessaire
  if (error) {
    return (
      <Text color="red">
        Erreur lors du chargement des playlists: {(error as Error).message}
      </Text>
    );
  }
  
  // Récupérer les playlists
  const playlists = data?.playlists || [];
  
  return (
    <View>
      <Flex justifyContent="space-between" alignItems="center" marginBottom="1.5rem">
        <Heading level={3}>Playlists {data?.count ? `(${data.count})` : ''}</Heading>
        
        {showAddButton && canEdit && !hideAddButton && (
          <Flex direction="column" alignItems="flex-end">
            <ChordoraButton 
              onClick={handleCreatePlaylist}
              variation="primary"
              size="small"
            >
              <FaPlus style={{ marginRight: '0.5rem' }} />
              Nouvelle playlist
            </ChordoraButton>
            
            {/* Message informatif sur la restriction */}
            <Text fontSize="small" color="var(--chordora-text-secondary)" marginTop="0.5rem">
              Vous pourrez y ajouter uniquement vos propres pistes.
            </Text>
          </Flex>
        )}
      </Flex>
      
      {/* Afficher un message si aucune playlist n'est trouvée */}
      {playlists.length === 0 ? (
        <View padding="2rem" textAlign="center">
          <Text marginBottom="1rem">Aucune playlist pour le moment</Text>
          
          {showAddButton && canEdit && !hideAddButton && (
            <ChordoraButton 
              onClick={handleCreatePlaylist}
              variation="primary"
              style={{ borderRadius: '20px' }}
            >
              <FaPlus style={{ marginRight: '0.5rem' }} />
              Créer ma première playlist
            </ChordoraButton>
          )}
        </View>
      ) : (
        <Flex 
          wrap="wrap" 
          gap="1rem"
        >
          {playlists.map((playlist) => (
            <Card
              key={playlist.playlist_id}
              onClick={() => handlePlaylistClick(playlist.playlist_id)}
              padding="0"
              width={{ base: '100%', small: 'calc(50% - 0.5rem)', medium: '12rem' }}
              height="12rem"
              style={{ cursor: 'pointer', position: 'relative', overflow: 'hidden' }}
            >
              {/* Image de couverture (ou fallback) */}
              <div 
                style={{ 
                  position: 'relative', 
                  width: '100%', 
                  height: '60%',
                  backgroundColor: '#121212',
                  backgroundImage: playlist.cover_image_url ? `url(${playlist.cover_image_url})` : 'linear-gradient(to right, #3e1dfc, #87e54c)',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              >
                {/* Badge public/privé */}
                {playlist.is_public !== undefined && (
                  <Badge 
                    variation={playlist.is_public ? "info" : "warning"}
                    style={{ position: 'absolute', top: '0.5rem', right: '0.5rem' }}
                  >
                    {playlist.is_public ? 
                      <FaGlobe style={{ marginRight: '0.25rem' }} /> : 
                      <FaLock style={{ marginRight: '0.25rem' }} />
                    }
                    {playlist.is_public ? 'Public' : 'Privé'}
                  </Badge>
                )}
                
                {/* Icône de musique si pas d'image */}
                {!playlist.cover_image_url && (
                  <Flex 
                    alignItems="center" 
                    justifyContent="center" 
                    height="100%"
                  >
                    <FaMusic color="#ffffff" size={24} />
                  </Flex>
                )}
              </div>
              
              {/* Informations de la playlist */}
              <Flex 
                direction="column" 
                padding="0.75rem"
                height="40%"
                justifyContent="space-between"
              >
                <div>
                  <Text 
                    fontWeight="bold" 
                    fontSize="1rem"
                    style={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {playlist.title}
                  </Text>
                  <Text fontSize="0.8rem" color="var(--chordora-text-secondary)">
                    {playlist.track_count || 0} {(playlist.track_count || 0) === 1 ? 'piste' : 'pistes'}
                  </Text>
                </div>
                
                {/* Actions (édition, suppression) */}
                {canEdit && (
                  <Flex 
                    position="absolute"
                    bottom="0.5rem"
                    right="0.5rem"
                    gap="0.5rem"
                  >
                    <ChordoraButton
                      onClick={(e) => handleEditClick(playlist.playlist_id, e)}
                      variation="link"
                      size="small"
                      padding="0.25rem"
                    >
                      <FaEdit size={16} />
                    </ChordoraButton>
                    <ChordoraButton
                      onClick={(e) => handleDeletePlaylist(playlist, e)}
                      variation="link"
                      size="small"
                      padding="0.25rem"
                      style={{ color: 'red' }}
                    >
                      <FaTrash size={16} />
                    </ChordoraButton>
                  </Flex>
                )}
              </Flex>
            </Card>
          ))}
        </Flex>
      )}
      
      {/* Alerte informative sur les restrictions */}
      {showAddButton && canEdit && playlists.length > 0 && (
        <Alert
          variation="info"
          marginTop="2rem"
          isDismissible={true}
        >
          <Text fontSize="0.9rem">
            Rappel : Vous ne pouvez ajouter que vos propres pistes à vos playlists.
          </Text>
        </Alert>
      )}
    </View>
  );
};

export default PlaylistList;