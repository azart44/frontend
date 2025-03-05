import React, { useState } from 'react';
import { 
  View, 
  Heading, 
  Text, 
  Button, 
  Flex, 
  Loader, 
  Card,
  RadioGroupField,
  Alert
} from '@aws-amplify/ui-react';
import { Track } from '../../types/TrackTypes';
import { useUserPlaylists, useUpdatePlaylist } from '../../hooks/usePlaylists';
import { FaPlus } from 'react-icons/fa';
import CustomModal from '../common/CustomModal';
import PlaylistForm from './PlaylistForm';

interface AddToPlaylistProps {
  track: Track;
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Composant pour ajouter une piste à une playlist existante
 * ou pour créer une nouvelle playlist avec cette piste
 */
const AddToPlaylist: React.FC<AddToPlaylistProps> = ({ 
  track, 
  isOpen, 
  onClose 
}) => {
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
  
  // Gérer l'ajout à une playlist existante
  const handleAddToExistingPlaylist = async () => {
    if (!selectedPlaylistId) {
      setErrorMessage('Veuillez sélectionner une playlist');
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
      
      // Préparer les données pour la mise à jour
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
      setSuccessMessage(`Piste ajoutée à la playlist "${selectedPlaylist.title}"`);
      
      // Réinitialiser la sélection
      setSelectedPlaylistId('');
      
      // Rafraîchir la liste des playlists
      refetchPlaylists();
      
      // Fermer le modal après un court délai
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error) {
      console.error('Erreur lors de l\'ajout à la playlist:', error);
      setErrorMessage('Une erreur est survenue lors de l\'ajout à la playlist');
    }
  };
  
  // Gérer le succès de la création d'une nouvelle playlist
  const handleNewPlaylistSuccess = () => {
    setShowNewPlaylistForm(false);
    setSuccessMessage('Piste ajoutée à la nouvelle playlist');
    
    // Rafraîchir la liste des playlists
    refetchPlaylists();
    
    // Fermer le modal après un court délai
    setTimeout(() => {
      onClose();
    }, 1500);
  };
  
  return (
    <CustomModal
      isOpen={isOpen}
      onClose={onClose}
      title={showNewPlaylistForm ? "Créer une nouvelle playlist" : "Ajouter à une playlist"}
      footer={
        !showNewPlaylistForm && (
          <Flex gap="1rem">
            <Button onClick={onClose} variation="link">
              Annuler
            </Button>
            <Button 
              onClick={handleAddToExistingPlaylist} 
              variation="primary"
              isDisabled={!selectedPlaylistId || updatePlaylistMutation.isPending}
              isLoading={updatePlaylistMutation.isPending}
            >
              Ajouter
            </Button>
          </Flex>
        )
      }
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
        
        {showNewPlaylistForm ? (
          <PlaylistForm 
            initialData={{
              title: '',
              description: '',
              is_public: true,
              tracks: [{ track_id: track.track_id }]
            }}
            onSuccess={handleNewPlaylistSuccess}
            onCancel={() => setShowNewPlaylistForm(false)}
          />
        ) : (
          <>
            <Flex gap="1rem" direction="column">
              {isLoadingPlaylists ? (
                <Flex justifyContent="center" padding="2rem">
                  <Loader size="large" />
                </Flex>
              ) : playlistsData?.playlists && playlistsData.playlists.length > 0 ? (
                <>
                  <Text fontWeight="bold">
                    Sélectionnez une playlist existante :
                  </Text>
                  
                  <RadioGroupField
                    label="Playlists"
                    name="playlist"
                    labelHidden
                    value={selectedPlaylistId}
                    onChange={(e) => setSelectedPlaylistId(e.target.value)}
                  >
                    <Flex direction="column" gap="0.5rem">
                      {playlistsData.playlists.map((playlist) => (
                        <div key={playlist.playlist_id}>
                          <input
                            type="radio"
                            name="playlist"
                            value={playlist.playlist_id}
                            checked={selectedPlaylistId === playlist.playlist_id}
                            onChange={(e) => setSelectedPlaylistId(e.target.value)}
                            id={`playlist-${playlist.playlist_id}`}
                            style={{ marginRight: '8px' }}
                          />
                          <label htmlFor={`playlist-${playlist.playlist_id}`}>
                            {playlist.title} ({playlist.track_count || 0} pistes)
                          </label>
                        </div>
                      ))}
                    </Flex>
                  </RadioGroupField>
                </>
              ) : (
                <Text>Vous n'avez pas encore de playlist.</Text>
              )}
              
              <Button 
                onClick={() => setShowNewPlaylistForm(true)}
                variation="link"
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <FaPlus /> Créer une nouvelle playlist
              </Button>
            </Flex>
          </>
        )}
      </CustomModal.Body>
    </CustomModal>
  );
};

export default AddToPlaylist;