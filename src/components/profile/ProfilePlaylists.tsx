import React, { useState } from 'react';
import { 
  View, 
  Heading, 
  Text, 
  Tabs, 
  Card,
  Button
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
 */
const ProfilePlaylists: React.FC<ProfilePlaylistsProps> = ({ userId, isOwnProfile }) => {
  const navigate = useNavigate();
  const [activeTabIndex, setActiveTabIndex] = useState(0);

  return (
    <Card padding="2rem">
      <Heading level={3} marginBottom="1.5rem">Ma bibliothèque musicale</Heading>
      
      <Tabs
        justifyContent="flex-start"
        currentIndex={activeTabIndex}
        onChange={(i) => setActiveTabIndex(i)}
        items={[
          {
            id: "tracks",
            label: "Mes pistes",
            content: (
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
            )
          },
          {
            id: "playlists",
            label: "Mes playlists",
            content: (
              <View marginTop="1.5rem">
                <div>
                  <PlaylistList 
                    userId={userId} 
                    showAddButton={isOwnProfile}
                  />
                </div>
              </View>
            )
          }
        ]}
      />
    </Card>
  );
};

export default ProfilePlaylists;