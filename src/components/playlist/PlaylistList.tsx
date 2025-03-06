import React, { useState } from 'react';
import { 
  View, 
  Heading, 
  Text, 
  Button, 
  Flex, 
  Loader, 
  Card,
  Badge
} from '@aws-amplify/ui-react';
import { useNavigate } from 'react-router-dom';
import { FaPlay, FaEdit, FaTrash, FaPlus } from 'react-icons/fa';
import { useUserPlaylists, useDeletePlaylist } from '../../hooks/usePlaylists';
import { useAudioContext } from '../../contexts/AudioContext';
import { useAuth } from '../../contexts/AuthContext';
import PlaylistForm from './PlaylistForm';
import { Playlist } from '../../types/PlaylistTypes';

interface PlaylistListProps {
  userId?: string;
  showAddButton?: boolean;
  onAddPlaylist?: () => void;
  onPlaylistClick?: (playlist: Playlist) => void;
}

/**
 * Composant pour afficher la liste des playlists d'un utilisateur
 */
const PlaylistList: React.FC<PlaylistListProps> = ({ 
  userId, 
  showAddButton = true,
  onAddPlaylist,
  onPlaylistClick
}) => {
  const navigate = useNavigate();
  const { userId: authUserId } = useAuth();
  const { playTrack } = useAudioContext();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingPlaylist, setEditingPlaylist] = useState<Playlist | null>(null);
  
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
  const handlePlaylistClick = (playlist: Playlist) => {
    if (onPlaylistClick) {
      onPlaylistClick(playlist);
    } else {
      // Navigation par défaut vers la page de détail
      navigate(`/playlists/${playlist.playlist_id}`);
    }
  };
  
  // Gérer la suppression d'une playlist
  const handleDeletePlaylist = async (playlist: Playlist, e: React.MouseEvent) => {
    e.stopPropagation(); // Éviter de déclencher le clic sur la playlist
    
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
  const handleEditClick = (playlist: Playlist, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingPlaylist(playlist);
  };
  
  // Déterminer si l'utilisateur peut modifier les playlists
  const canEdit = userId === authUserId || !userId;
  
  // Afficher le formulaire d'ajout si nécessaire
  const handleCreatePlaylist = () => {
    if (onAddPlaylist) {
      onAddPlaylist();
    } else {
      navigate('/playlists/new');
    }
  };
  
  // Afficher le formulaire d'ajout si nécessaire
  if (showAddForm) {
    return (
      <View>
        <PlaylistForm 
          onSuccess={(playlist) => {
            setShowAddForm(false);
            // Optionnel : naviguer vers la nouvelle playlist
            navigate(`/playlists/${playlist.playlist_id}`);
          }}
          onCancel={() => setShowAddForm(false)}
        />
      </View>
    );
  }
  
  // Afficher le formulaire d'édition si nécessaire
  if (editingPlaylist) {
    return (
      <View>
        <PlaylistForm 
          initialData={editingPlaylist}
          onSuccess={() => {
            setEditingPlaylist(null);
            refetch();
          }}
          onCancel={() => setEditingPlaylist(null)}
        />
      </View>
    );
  }
  
  // Afficher un loader pendant le chargement
  if (isLoading) {
    return (
      <Flex justifyContent="center" padding="2rem">
        <Loader size="large" />
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
  
  // Afficher un message si aucune playlist n'est trouvée
  if (playlists.length === 0) {
    return (
      <View padding="2rem" textAlign="center">
        <Text marginBottom="1rem">Aucune playlist pour le moment</Text>
        
        {showAddButton && canEdit && (
          <Button 
            onClick={handleCreatePlaylist}
            variation="primary"
            style={{ borderRadius: '20px' }}
          >
            <FaPlus style={{ marginRight: '0.5rem' }} />
            Créer ma première playlist
          </Button>
        )}
      </View>
    );
  }
  
  return (
    <View>
      <Flex justifyContent="space-between" alignItems="center" marginBottom="1rem">
        <Heading level={3}>Playlists {data?.count ? `(${data.count})` : ''}</Heading>
        
        {showAddButton && canEdit && (
          <Button 
            onClick={handleCreatePlaylist}
            variation="primary"
            size="small"
          >
            <FaPlus style={{ marginRight: '0.5rem' }} />
            Nouvelle playlist
          </Button>
        )}
      </Flex>
      
      <Flex 
        wrap="wrap" 
        gap="1rem"
      >
        {playlists.map((playlist) => (
          <Card
            key={playlist.playlist_id}
            onClick={() => handlePlaylistClick(playlist)}
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
                backgroundColor: '#f0f0f0',
                backgroundImage: playlist.cover_image_url ? `url(${playlist.cover_image_url})` : 'linear-gradient(to right, #3e1dfc, #87e54c)',
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            >
              {!playlist.is_public && (
                <Badge 
                  variation="warning"
                  style={{ position: 'absolute', top: '0.5rem', right: '0.5rem' }}
                >
                  Privée
                </Badge>
              )}
              
              {/* Overlay avec bouton de lecture */}
              <div 
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'rgba(0,0,0,0.2)',
                  opacity: 0,
                  transition: 'opacity 0.2s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                onMouseLeave={(e) => e.currentTarget.style.opacity = '0'}
              >
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (playlist.tracks && playlist.tracks.length > 0) {
                      // Jouer la première piste
                      playTrack(playlist.tracks[0]);
                    }
                  }}
                  variation="primary"
                  size="small"
                  style={{
                    borderRadius: '50%',
                    width: '3rem',
                    height: '3rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  isDisabled={!playlist.track_count}
                >
                  <FaPlay />
                </Button>
              </div>
            </div>
            
            {/* Informations de la playlist */}
            <Flex 
              direction="column" 
              padding="0.75rem"
              height="40%"
            >
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
              <Text fontSize="0.8rem" color="#808080">
                {playlist.track_count} {playlist.track_count === 1 ? 'piste' : 'pistes'}
              </Text>
              
              {/* Actions (édition, suppression) */}
              {canEdit && (
                <Flex 
                  position="absolute"
                  bottom="0.5rem"
                  right="0.5rem"
                  gap="0.5rem"
                >
                  <Button
                    onClick={(e) => handleEditClick(playlist, e)}
                    variation="link"
                    size="small"
                    padding="0.25rem"
                  >
                    <FaEdit size={16} />
                  </Button>
                  <Button
                    onClick={(e) => handleDeletePlaylist(playlist, e)}
                    variation="link"
                    size="small"
                    padding="0.25rem"
                    style={{ color: 'red' }}
                  >
                    <FaTrash size={16} />
                  </Button>
                </Flex>
              )}
            </Flex>
          </Card>
        ))}
      </Flex>
    </View>
  );
};

export default PlaylistList;