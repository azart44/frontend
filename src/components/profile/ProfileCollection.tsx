import React, { useState } from 'react';
import { 
  View, 
  Heading, 
  Card,
  Button,
  Flex,
  Text,
  Badge,
  Alert,
  Loader
} from '@aws-amplify/ui-react';
import { useNavigate } from 'react-router-dom';
import { useUserTracks } from '../../hooks/useTracks';
import { useUserPlaylists } from '../../hooks/usePlaylists';
import { FaPlus, FaMusic, FaList } from 'react-icons/fa';
import TrackList from '../track/TrackList';
import PlaylistList from '../playlist/PlaylistList';
import { Track } from '../../types/TrackTypes';
import { Playlist } from '../../types/PlaylistTypes';

interface ProfileCollectionProps {
  userId: string;
  isOwnProfile: boolean;
}

/**
 * Composant pour afficher et gérer la collection de l'utilisateur (pistes et playlists)
 * dans son profil
 */
const ProfileCollection: React.FC<ProfileCollectionProps> = ({ userId, isOwnProfile }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'tracks' | 'playlists'>('tracks');
  
  // Hooks pour récupérer les données
  const { 
    data: tracksData, 
    isLoading: isLoadingTracks, 
    error: tracksError,
    refetch: refetchTracks
  } = useUserTracks(userId);
  
  const {
    data: playlistsData,
    isLoading: isLoadingPlaylists,
    error: playlistsError,
    refetch: refetchPlaylists
  } = useUserPlaylists(userId);
  
  // Fonction pour ajouter une nouvelle piste
  const handleAddTrack = () => {
    navigate('/add-track');
  };
  
  // Fonction pour créer une nouvelle playlist
  const handleCreatePlaylist = () => {
    navigate('/playlists/new');
  };
  
  return (
    <Card padding="1.5rem" borderRadius="8px">
      <Heading level={3} marginBottom="1rem">Ma Collection</Heading>
      
      {/* Onglets */}
      <Flex 
        style={{ borderBottom: "1px solid var(--chordora-divider)" }} 
        marginBottom="1.5rem"
      >
        <button
          onClick={() => setActiveTab('tracks')}
          style={{
            background: 'transparent',
            border: 'none',
            padding: '1rem 1.5rem',
            cursor: 'pointer',
            color: activeTab === 'tracks' ? 'var(--chordora-primary)' : 'var(--chordora-text-secondary)',
            fontWeight: activeTab === 'tracks' ? 'bold' : 'normal',
            borderBottom: activeTab === 'tracks' ? '2px solid var(--chordora-primary)' : 'none',
            transition: 'all 0.3s ease'
          }}
        >
          <Flex alignItems="center" gap="0.5rem">
            <FaMusic />
            <Text>Pistes</Text>
            {tracksData && (
              <Badge variation="info" size="small">{tracksData.count}</Badge>
            )}
          </Flex>
        </button>
        
        <button
          onClick={() => setActiveTab('playlists')}
          style={{
            background: 'transparent',
            border: 'none',
            padding: '1rem 1.5rem',
            cursor: 'pointer',
            color: activeTab === 'playlists' ? 'var(--chordora-primary)' : 'var(--chordora-text-secondary)',
            fontWeight: activeTab === 'playlists' ? 'bold' : 'normal',
            borderBottom: activeTab === 'playlists' ? '2px solid var(--chordora-primary)' : 'none',
            transition: 'all 0.3s ease'
          }}
        >
          <Flex alignItems="center" gap="0.5rem">
            <FaList />
            <Text>Playlists</Text>
            {playlistsData && (
              <Badge variation="info" size="small">{playlistsData.count}</Badge>
            )}
          </Flex>
        </button>
      </Flex>
      
      {/* Bouton d'ajout (seulement pour le propriétaire du profil) */}
      {isOwnProfile && (
        <Flex justifyContent="flex-end" marginBottom="1.5rem">
          <Button 
            onClick={activeTab === 'tracks' ? handleAddTrack : handleCreatePlaylist}
            variation="primary"
            style={{ 
              borderRadius: '20px',
              backgroundColor: 'var(--chordora-primary)'
            }}
          >
            <FaPlus style={{ marginRight: '0.5rem' }} />
            {activeTab === 'tracks' ? 'Ajouter une piste' : 'Créer une playlist'}
          </Button>
        </Flex>
      )}
      
      {/* Contenu des onglets */}
      {activeTab === 'tracks' && (
        <>
          {isLoadingTracks ? (
            <Flex justifyContent="center" padding="2rem">
              <Loader size="large" />
            </Flex>
          ) : tracksError ? (
            <Alert variation="error" heading="Erreur">
              Une erreur est survenue lors du chargement des pistes.
            </Alert>
          ) : (
            <TrackList 
              userId={userId} 
              onRefresh={refetchTracks} 
            />
          )}
        </>
      )}
      
      {activeTab === 'playlists' && (
        <>
          {isLoadingPlaylists ? (
            <Flex justifyContent="center" padding="2rem">
              <Loader size="large" />
            </Flex>
          ) : playlistsError ? (
            <Alert variation="error" heading="Erreur">
              Une erreur est survenue lors du chargement des playlists.
            </Alert>
          ) : (
            <PlaylistList 
              userId={userId}
              showAddButton={isOwnProfile} 
              onAddPlaylist={handleCreatePlaylist}
            />
          )}
        </>
      )}
    </Card>
  );
};

export default ProfileCollection;