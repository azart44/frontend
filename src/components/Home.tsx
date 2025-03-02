import React, { useState, useEffect } from 'react';
import { 
  Grid, 
  Flex, 
  Heading, 
  Text, 
  Card, 
  Image, 
  Badge,
  Button,
  View
} from '@aws-amplify/ui-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FaPlay, FaHeart, FaDownload, FaEllipsisH } from 'react-icons/fa';
import { Track } from '../types/TrackTypes';
import '../ChordoraTheme.css';

// Types pour les composants
interface TrackCardProps {
  track: Track;
  onPlay: (track: Track) => void;
}

interface ArtistCardProps {
  artist: {
    userId: string;
    username: string;
    userType?: string;
    profileImageUrl?: string;
  };
}

// Composant pour une carte de piste audio
const TrackCard: React.FC<TrackCardProps> = ({ track, onPlay }) => {
  const navigate = useNavigate();
  
  return (
    <Card className="content-card">
      <Flex direction="column">
        <Flex alignItems="center" gap="1rem">
          <Image
            src={track.cover_image || "/default-cover.jpg"}
            alt={track.title}
            height="64px"
            width="64px"
            objectFit="cover"
            borderRadius="4px"
          />
          <Flex direction="column" flex="1">
            <Text fontWeight="bold" fontSize="1.1rem" color="white">{track.title}</Text>
            <Flex alignItems="center" gap="0.5rem">
              <Text 
                fontSize="0.9rem" 
                color="#a0a0a0"
                onClick={() => navigate(`/profile/${track.user_id}`)}
                style={{ cursor: 'pointer' }}
              >
                {track.artist}
              </Text>
              <Flex alignItems="center">
                <Badge
                  backgroundColor="#3e1dfc"
                  color="white"
                  fontSize="0.7rem"
                  padding="0.2rem 0.4rem"
                  borderRadius="4px"
                >
                  {track.genre}
                </Badge>
                {track.bpm && (
                  <Badge
                    backgroundColor="#2a2d36"
                    color="white"
                    fontSize="0.7rem"
                    padding="0.2rem 0.4rem"
                    borderRadius="4px"
                    marginLeft="0.4rem"
                  >
                    {track.bpm} BPM
                  </Badge>
                )}
              </Flex>
            </Flex>
          </Flex>
          <Button
            onClick={() => onPlay(track)}
            backgroundColor="#87e54c"
            color="#121416"
            size="small"
            borderRadius="50%"
            width="40px"
            height="40px"
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <FaPlay />
          </Button>
        </Flex>
        
        <Flex style={{ height: '40px', backgroundColor: '#121416', marginTop: '1rem', borderRadius: '4px' }}>
          <View className="audio-waveform" padding="0 10px" style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
            {[...Array(10)].map((_, i) => (
              <View key={i} className="bar" style={{ animationDelay: `${i * 0.1}s` }} />
            ))}
          </View>
        </Flex>
        
        <Flex justifyContent="space-between" marginTop="0.8rem">
          <Flex gap="0.8rem">
            <Button
              backgroundColor="transparent"
              color="white"
              padding="0"
              display="flex"
              alignItems="center"
              gap="0.3rem"
            >
              <FaHeart color="#a0a0a0" />
              <Text fontSize="0.8rem" color="#a0a0a0">{track.likes || 0}</Text>
            </Button>
            
            <Button
              backgroundColor="transparent"
              color="white"
              padding="0"
              display="flex"
              alignItems="center"
              gap="0.3rem"
            >
              <FaDownload color="#a0a0a0" />
              <Text fontSize="0.8rem" color="#a0a0a0">{track.downloads || 0}</Text>
            </Button>
          </Flex>
          
          <Text fontSize="0.8rem" color="#a0a0a0">
            {track.duration ? `${Math.floor(track.duration / 60)}:${String(Math.floor(track.duration % 60)).padStart(2, '0')}` : '0:00'}
          </Text>
        </Flex>
      </Flex>
    </Card>
  );
};

// Composant pour une carte d'artiste
const ArtistCard: React.FC<ArtistCardProps> = ({ artist }) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  
  return (
    <Card 
      className="content-card" 
      onClick={() => navigate(`/profile/${artist.userId}`)}
      style={{ cursor: 'pointer' }}
    >
      <Flex alignItems="center" gap="1rem">
        <Image
          src={artist.profileImageUrl || "/default-profile.jpg"}
          alt={artist.username}
          height="50px"
          width="50px"
          objectFit="cover"
          borderRadius="50%"
        />
        <Flex direction="column" flex="1">
          <Text fontWeight="bold" color="white">{artist.username}</Text>
          {artist.userType && (
            <Badge
              backgroundColor="#3e1dfc"
              color="white"
              fontSize="0.7rem"
              padding="0.2rem 0.4rem"
              borderRadius="4px"
            >
              {artist.userType}
            </Badge>
          )}
        </Flex>
        {isAuthenticated && (
          <Button
            size="small"
            backgroundColor="transparent"
            border="1px solid #87e54c"
            color="#87e54c"
            borderRadius="4px"
            padding="0.3rem 0.6rem"
            fontSize="0.8rem"
            onClick={(e) => {
              e.stopPropagation();
              // Logique pour suivre l'artiste
            }}
          >
            Suivre
          </Button>
        )}
      </Flex>
    </Card>
  );
};

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [trendingTracks, setTrendingTracks] = useState<Track[]>([]);
  const [topArtists, setTopArtists] = useState<ArtistCardProps['artist'][]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Simuler des données
        const tracks: Track[] = [
          {
            track_id: '1',
            title: 'Summer Vibes',
            artist: 'Keiji',
            user_id: '14a874d8-a001-7079-ae6e-45fab155068c',
            genre: 'Trap',
            bpm: 140,
            duration: 183,
            likes: 124,
            downloads: 45,
            cover_image: 'https://chordora-users.s3.us-east-1.amazonaws.com/public/default-profile'
          },
          {
            track_id: '2',
            title: 'Night Drive',
            artist: 'Project Blvck',
            user_id: 'user2',
            genre: 'Drill',
            bpm: 165,
            duration: 201,
            likes: 87,
            downloads: 32,
            cover_image: 'https://via.placeholder.com/64'
          },
          {
            track_id: '3',
            title: 'Cloud Nine',
            artist: 'SeaSky',
            user_id: 'user3',
            genre: 'R&B',
            bpm: 95,
            duration: 175,
            likes: 156,
            downloads: 67,
            cover_image: 'https://via.placeholder.com/64'
          }
        ];
        
        setTrendingTracks(tracks);
        
        // Simuler des données d'artistes
        const artists = [
          {
            userId: '14a874d8-a001-7079-ae6e-45fab155068c',
            username: 'Keiji',
            userType: 'producer',
            profileImageUrl: 'https://chordora-users.s3.us-east-1.amazonaws.com/public/default-profile'
          },
          {
            userId: 'user2',
            username: 'Project Blvck',
            userType: 'beatmaker',
            profileImageUrl: 'https://via.placeholder.com/50'
          },
          {
            userId: 'user3',
            username: 'SeaSky',
            userType: 'artist',
            profileImageUrl: 'https://via.placeholder.com/50'
          },
          {
            userId: 'user4',
            username: 'B',
            userType: 'loopmaker',
            profileImageUrl: 'https://via.placeholder.com/50'
          },
          {
            userId: 'user5',
            username: 'D. Sharp',
            userType: 'producer',
            profileImageUrl: 'https://via.placeholder.com/50'
          }
        ];
        
        setTopArtists(artists);
      } catch (error) {
        console.error('Erreur lors de la récupération des données:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Gérer la lecture d'une piste
  const handlePlayTrack = (track: Track) => {
    // Ici, vous pouvez implémenter la logique pour jouer la piste
    console.log('Lecture de la piste:', track);
    // Vous pourriez utiliser un state global ou un contexte pour gérer le lecteur audio
  };
  
  return (
    <View className="homepage">
      {/* En-tête avec banner */}
      <View 
        backgroundColor="#2a2d36" 
        height="200px" 
        borderRadius="12px"
        marginBottom="2rem"
        style={{
          backgroundImage: 'linear-gradient(135deg, #3e1dfc 0%, #87e54c 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          padding: '1rem'
        }}
      >
        <Flex direction="column" alignItems="center">
          <Heading level={1} color="white" fontWeight="bold">
            Bienvenue sur Chordora
          </Heading>
          <Text color="white" maxWidth="600px" marginTop="1rem">
            Connectez-vous avec des beatmakers et des artistes, partagez vos créations et trouvez votre prochaine collaboration musicale.
          </Text>
          {!isAuthenticated && (
            <Button 
              onClick={() => navigate('/auth')}
              marginTop="1.5rem"
              backgroundColor="#87e54c"
              color="#121416"
              fontWeight="bold"
              padding="0.8rem 1.5rem"
              borderRadius="30px"
            >
              Commencer maintenant
            </Button>
          )}
        </Flex>
      </View>
      
      <Grid
        templateColumns={{ base: '1fr', medium: '3fr 1fr' }}
        gap="2rem"
      >
        {/* Section principale - Pistes en tendance */}
        <View>
          <Heading level={3} color="#87e54c" marginBottom="1rem">
            Pistes en tendance
          </Heading>
          
          <Flex direction="column" gap="1rem">
            {trendingTracks.map(track => (
              <TrackCard 
                key={track.track_id}
                track={track}
                onPlay={handlePlayTrack}
              />
            ))}
          </Flex>
          
          <Button
            variation="link"
            color="#87e54c"
            marginTop="1rem"
            onClick={() => navigate('/explore')}
          >
            Voir plus de pistes →
          </Button>
        </View>
        
        {/* Sidebar - Artistes populaires et activité récente */}
        <View>
          <Heading level={3} color="#87e54c" marginBottom="1rem">
            Artistes populaires
          </Heading>
          
          <Flex direction="column" gap="0.8rem">
            {topArtists.map(artist => (
              <ArtistCard key={artist.userId} artist={artist} />
            ))}
          </Flex>
          
          <Button
            variation="link"
            color="#87e54c"
            marginTop="1rem"
            onClick={() => navigate('/users')}
          >
            Explorer tous les artistes →
          </Button>
          
          {isAuthenticated && (
            <>
              <Heading level={3} color="#87e54c" marginTop="2rem" marginBottom="1rem">
                Activité récente
              </Heading>
              
              <Card className="content-card">
                <Text color="#a0a0a0" textAlign="center">
                  Suivez des artistes pour voir leur activité récente ici.
                </Text>
              </Card>
            </>
          )}
        </View>
      </Grid>
    </View>
  );
};

export default HomePage;