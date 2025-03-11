import React, { useState, useEffect } from 'react';
import { 
  Text, 
  Flex, 
  Loader, 
  Alert,
  Image,
  View,
  Divider
} from '@aws-amplify/ui-react';
import { Track } from '../../types/TrackTypes';
import { useUserPlaylists, useUpdatePlaylist } from '../../hooks/usePlaylists';
import { FaPlus, FaCheck, FaMusic, FaList } from 'react-icons/fa';
import CustomModal from '../common/CustomModal';
import PlaylistForm from './PlaylistForm';
import { Playlist } from '../../types/PlaylistTypes';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import ChordoraButton from '../common/ChordoraButton';

interface AddToPlaylistProps {
  track: Track;
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Composant pour ajouter une piste à une playlist existante
 * ou pour créer une nouvelle playlist avec cette piste
 * Version corrigée avec la nouvelle charte graphique
 */
const AddToPlaylist: React.FC<AddToPlaylistProps> = ({ 
  track, 
  isOpen, 
  onClose 
}) => {
  const navigate = useNavigate();
  const { isAuthenticated, userId } = useAuth();
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string>('');
  const [showNewPlaylistForm, setShowNewPlaylistForm] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // Récupérer les playlists de l'utilisateur
  const { 
    data: playlistsData, 
    isLoading: isLoadingPlaylists,
    refetch: refetchPlaylists
  } = useUserPlaylists();
  
  // Mutation pour mettre à jour une playlist
  const updatePlaylistMutation = useUpdatePlaylist();
  
  // Vérifier que l'utilisateur est bien le propriétaire de la piste
  useEffect(() => {
    if (track && userId && track.user_id !== userId) {
      setErrorMessage("Vous ne pouvez ajouter à vos playlists que vos propres pistes.");
    } else {
      setErrorMessage(null);
    }
  }, [track, userId]);
  
  // Gérer le succès de la création d'une nouvelle playlist
  const handleNewPlaylistSuccess = (playlist: Playlist) => {
    setShowNewPlaylistForm(false);
    setSuccessMessage(`Piste "${track.title}" ajoutée à la nouvelle playlist "${playlist.title}"`);
    
    // Rafraîchir la liste des playlists
    refetchPlaylists();
    
    // Fermer le modal après un court délai
    setTimeout(() => {
      onClose();
    }, 1500);
  };
  
  // Gérer l'ajout à une playlist existante
  const handleAddToExistingPlaylist = async () => {
    if (!isAuthenticated) {
      navigate('/auth');
      return;
    }

    if (!selectedPlaylistId) {
      setErrorMessage('Veuillez sélectionner une playlist');
      return;
    }
    
    // Vérification supplémentaire de propriété
    if (track.user_id !== userId) {
      setErrorMessage("Vous ne pouvez ajouter à vos playlists que vos propres pistes.");
      return;
    }
    
    try {
      setErrorMessage(null);
      
      // Trouver la playlist sélectionnée
      const selectedPlaylist = playlistsData?.playlists.find(
        playlist => playlist.playlist_id === selectedPlaylistId
      );
      
      if (!selectedPlaylist) {
        throw new Error('Playlist introuvable');
      }
      
      // Vérifier si la piste est déjà dans la playlist
      const trackIds = selectedPlaylist.track_ids || [];
      
      if (trackIds.includes(track.track_id)) {
        setErrorMessage('Cette piste est déjà dans la playlist sélectionnée');
        return;
      }
      
      // Ajouter la piste à la playlist
      const updatedTrackIds = [...trackIds, track.track_id];
      
      // Préparation des données pour la mise à jour
      const updateData = {
        playlist_id: selectedPlaylist.playlist_id,
        title: selectedPlaylist.title,
        description: selectedPlaylist.description,
        is_public: selectedPlaylist.is_public,
        cover_image_url: selectedPlaylist.cover_image_url,
        tracks: updatedTrackIds.map((id, index) => ({
          track_id: id,
          position: index
        }))
      };
      
      // Mettre à jour la playlist
      await updatePlaylistMutation.mutateAsync(updateData);
      
      // Afficher un message de succès
      setSuccessMessage(`Piste "${track.title}" ajoutée à la playlist "${selectedPlaylist.title}"`);
      
      // Réinitialiser la sélection
      setSelectedPlaylistId('');
      
      // Rafraîchir la liste des playlists
      await refetchPlaylists();
      
      // Fermer le modal après un court délai
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error) {
      console.error('Erreur lors de l\'ajout à la playlist:', error);
      setErrorMessage('Une erreur est survenue lors de l\'ajout à la playlist');
    }
  };
  
  // Nettoyer le state lors de la fermeture
  const handleClose = () => {
    setSuccessMessage(null);
    setErrorMessage(null);
    setSelectedPlaylistId('');
    setShowNewPlaylistForm(false);
    onClose();
  };
  
  return (
    <CustomModal
      isOpen={isOpen}
      onClose={handleClose}
      title={showNewPlaylistForm ? "Créer une nouvelle playlist" : "Ajouter à une playlist"}
      footer={
        !showNewPlaylistForm && (
          <Flex gap="1rem">
            {/* Bouton Annuler avec la nouvelle charte graphique */}
            <ChordoraButton 
              onClick={handleClose} 
              variation="link"
            >
              Annuler
            </ChordoraButton>
            
            {/* Bouton Ajouter avec la nouvelle charte graphique */}
            <ChordoraButton 
              onClick={handleAddToExistingPlaylist} 
              variation="primary"
              isDisabled={!selectedPlaylistId || updatePlaylistMutation.isPending || track.user_id !== userId}
              isLoading={updatePlaylistMutation.isPending}
            >
              Ajouter
            </ChordoraButton>
          </Flex>
        )
      }
      width="550px"
    >
      <CustomModal.Body>
        {successMessage && (
          <Alert 
            variation="success"
            isDismissible={true}
            heading="Succès"
            marginBottom="1rem"
          >
            {successMessage}
          </Alert>
        )}
        
        {errorMessage && (
          <Alert 
            variation="error"
            isDismissible={true}
            heading="Erreur"
            marginBottom="1rem"
            onDismiss={() => setErrorMessage(null)}
          >
            {errorMessage}
          </Alert>
        )}
        
        {/* Message d'information sur la restriction des playlists */}
        <Alert 
          variation="info" 
          heading="Information" 
          marginBottom="1.5rem"
        >
          Conformément aux règles de Chordora, vous ne pouvez ajouter à vos playlists que les pistes dont vous êtes le propriétaire.
        </Alert>
        
        {/* Si erreur de propriété, empêcher la suite */}
        {track.user_id !== userId ? (
          <Text textAlign="center" marginBottom="1rem">
            Vous ne pouvez pas ajouter cette piste car vous n'en êtes pas le propriétaire.
          </Text>
        ) : showNewPlaylistForm ? (
          <PlaylistForm 
            initialData={{
              title: '',
              description: '',
              is_public: true,
              tracks: [{ track_id: track.track_id, position: 0 }]
            }}
            onSuccess={handleNewPlaylistSuccess}
            onCancel={() => setShowNewPlaylistForm(false)}
          />
        ) : (
          <>
            {/* Informations sur la piste à ajouter */}
            <Flex alignItems="center" gap="1rem" marginBottom="1.5rem">
              <Image
                src={track.cover_image || '/default-cover.jpg'}
                alt={track.title}
                width="60px"
                height="60px"
                borderRadius="4px"
                style={{ objectFit: 'cover' }}
              />
              <Flex direction="column" flex="1">
                <Text fontWeight="bold">{track.title}</Text>
                <Text fontSize="0.9rem" color="var(--chordora-text-secondary)">
                  {track.artist || 'Artiste'} • {track.genre}
                </Text>
              </Flex>
            </Flex>
            
            <Divider style={{ margin: '0 0 1.5rem 0', backgroundColor: 'var(--chordora-divider)' }} />
            
            <Flex gap="1rem" direction="column">
              {isLoadingPlaylists ? (
                <Flex justifyContent="center" padding="2rem">
                  <Loader size="large" />
                </Flex>
              ) : playlistsData?.playlists && playlistsData.playlists.length > 0 ? (
                <>
                  <Flex alignItems="center" gap="0.5rem" marginBottom="0.5rem">
                    <FaList color="var(--chordora-text-secondary)" />
                    <Text fontWeight="bold">
                      Sélectionnez une playlist existante :
                    </Text>
                  </Flex>
                  
                  <View 
                    backgroundColor="var(--chordora-bg-secondary)"
                    padding="0.5rem"
                    borderRadius="8px"
                    maxHeight="250px"
                    overflow="auto"
                  >
                    {playlistsData.playlists.map((playlist) => (
                      <Flex
                        key={playlist.playlist_id}
                        alignItems="center"
                        padding="0.75rem"
                        gap="1rem"
                        borderRadius="4px"
                        backgroundColor={selectedPlaylistId === playlist.playlist_id 
                          ? 'var(--chordora-active-bg)' 
                          : 'transparent'
                        }
                        style={{
                          cursor: 'pointer',
                          transition: 'background-color 0.2s ease'
                        }}
                        onClick={() => setSelectedPlaylistId(playlist.playlist_id)}
                        onMouseEnter={(e) => {
                          if (selectedPlaylistId !== playlist.playlist_id) {
                            e.currentTarget.style.backgroundColor = 'var(--chordora-hover-bg)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (selectedPlaylistId !== playlist.playlist_id) {
                            e.currentTarget.style.backgroundColor = 'transparent';
                          }
                        }}
                      >
                        <div
                          style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '4px',
                            backgroundColor: '#3e1dfc',
                            backgroundImage: playlist.cover_image_url ? `url(${playlist.cover_image_url})` : 'linear-gradient(135deg, #3e1dfc, #87e54c)',
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          {!playlist.cover_image_url && <FaMusic color="white" />}
                        </div>
                        
                        <Flex direction="column" flex="1">
                          <Text fontWeight="bold" color="var(--chordora-text-primary)">
                            {playlist.title}
                          </Text>
                          <Text fontSize="0.8rem" color="var(--chordora-text-secondary)">
                            {playlist.track_count || 0} pistes
                          </Text>
                        </Flex>
                        
                        {selectedPlaylistId === playlist.playlist_id && (
                          <FaCheck color="var(--chordora-primary)" size={18} />
                        )}
                      </Flex>
                    ))}
                  </View>
                </>
              ) : (
                <Flex 
                  direction="column" 
                  alignItems="center" 
                  gap="1rem" 
                  padding="2rem"
                  backgroundColor="var(--chordora-bg-secondary)"
                  borderRadius="8px"
                >
                  <FaMusic size={40} color="var(--chordora-text-secondary)" />
                  <Text>Vous n'avez pas encore de playlist.</Text>
                </Flex>
              )}
              
              {/* Bouton de création de nouvelle playlist avec la nouvelle charte graphique */}
              <ChordoraButton 
                onClick={() => setShowNewPlaylistForm(true)}
                variation="link"
                style={{ 
                  alignSelf: 'center',
                  marginTop: '1rem'
                }}
              >
                <FaPlus style={{ marginRight: '0.5rem' }} /> 
                Créer une nouvelle playlist
              </ChordoraButton>
            </Flex>
          </>
        )}
      </CustomModal.Body>
    </CustomModal>
  );
};

export default AddToPlaylist;
