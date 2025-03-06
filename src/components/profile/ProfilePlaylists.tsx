import React, { useState } from 'react';
import { 
  View, 
  Heading, 
  Card,
  Button,
  Flex
} from '@aws-amplify/ui-react';
import { useNavigate } from 'react-router-dom';
import PlaylistList from '../playlist/PlaylistList';
import TrackList from '../track/TrackList';
import { FaPlus } from 'react-icons/fa';

interface ProfilePlaylistsProps {
  userId: string;
  isOwnProfile: boolean;
}

/**
 * Composant pour afficher les playlists et les pistes d'un utilisateur dans son profil
 * Utilise une implémentation personnalisée d'onglets au lieu du composant Tabs d'Amplify UI
 */
const ProfilePlaylists: React.FC<ProfilePlaylistsProps> = ({ userId, isOwnProfile }) => {
  const navigate = useNavigate();
  const [activeTabIndex, setActiveTabIndex] = useState(0);

  return (
    <Card padding="2rem">
      <Heading level={3} marginBottom="1.5rem">Ma bibliothèque musicale</Heading>
      
      {/* Onglets personnalisés au lieu du composant Tabs d'Amplify UI */}
      <Flex gap="0.5rem" marginBottom="1rem">
        <Button 
          variation={activeTabIndex === 0 ? "primary" : "menu"}
          onClick={() => setActiveTabIndex(0)}
        >
          Mes pistes
        </Button>
        <Button 
          variation={activeTabIndex === 1 ? "primary" : "menu"}
          onClick={() => setActiveTabIndex(1)}
        >
          Mes playlists
        </Button>
      </Flex>
      
      {/* Contenu des onglets */}
      {activeTabIndex === 0 && (
        <View marginTop="1.5rem">
          {isOwnProfile && (
            <Button 
              onClick={() => navigate('/add-track')} 
              variation="primary"
              marginBottom="1.5rem"
            >
              <FaPlus style={{ marginRight: '0.5rem' }} />
              Ajouter une piste
            </Button>
          )}
          
          <TrackList userId={userId} />
        </View>
      )}
      
      {activeTabIndex === 1 && (
        <View marginTop="1.5rem">
          <PlaylistList 
            userId={userId} 
            showAddButton={isOwnProfile}
            onAddPlaylist={() => navigate('/playlists/new')}
          />
        </View>
      )}
    </Card>
  );
};

export default ProfilePlaylists;