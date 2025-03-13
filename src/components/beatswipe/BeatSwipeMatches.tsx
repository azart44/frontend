import React from 'react';
import { 
  View, 
  Heading, 
  Text, 
  Button, 
  Flex, 
  Loader, 
  Card,
  Image,
  Badge,
  Divider
} from '@aws-amplify/ui-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useSwipeMatches } from '../../hooks/useBeatSwipe';
import { useAudioContext } from '../../contexts/AudioContext';
import { 
  FaPlay, 
  FaPause, 
  FaArrowLeft, 
  FaMusic, 
  FaUser, 
  FaComment, 
  FaSyncAlt 
} from 'react-icons/fa';
import './BeatSwipeMatches.css';

const BeatSwipeMatches: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, userProfile } = useAuth();
  const { currentTrack, isPlaying, togglePlay, playTrack } = useAudioContext();
  
  // Récupérer les matches
  const { 
    data: matchesData, 
    isLoading, 
    error,
    refetch 
  } = useSwipeMatches();
  
  // Vérifier si l'utilisateur est authentifié
  if (!isAuthenticated) {
    return (
      <View padding="2rem">
        <Card padding="2rem" textAlign="center">
          <Heading level={3} marginBottom="1rem">Connexion requise</Heading>
          <Text marginBottom="1.5rem">
            Vous devez être connecté pour accéder à vos matches BeatSwipe.
          </Text>
          <Button 
            onClick={() => navigate('/auth')}
            variation="primary"
          >
            Se connecter
          </Button>
        </Card>
      </View>
    );
  }
  
  // Vérifier le rôle de l'utilisateur
  const userType = userProfile?.userType?.toLowerCase();
  const userRole = userType === 'rappeur' ? 'artist' : 'beatmaker';
  
  // Affichage du chargement
  if (isLoading) {
    return (
      <View padding="2rem">
        <Flex direction="column" alignItems="center" gap="1rem">
          <Loader size="large" />
          <Text>Chargement de vos matches...</Text>
        </Flex>
      </View>
    );
  }
  
  // Gestion des erreurs
  if (error) {
    return (
      <View padding="2rem">
        <Button 
          onClick={() => navigate('/beatswipe')}
          variation="link"
          marginBottom="1rem"
        >
          <FaArrowLeft style={{ marginRight: '0.5rem' }} />
          Retour à BeatSwipe
        </Button>
        
        <Card padding="2rem" textAlign="center">
          <Heading level={3} marginBottom="1rem">Erreur</Heading>
          <Text marginBottom="1.5rem">
            Une erreur est survenue lors du chargement de vos matches.
          </Text>
          <Button 
            onClick={() => refetch()}
            variation="primary"
          >
            <FaSyncAlt style={{ marginRight: '0.5rem' }} />
            Réessayer
          </Button>
        </Card>
      </View>
    );
  }
  
  // Récupérer les matches
  const matches = matchesData?.matches || [];
  
  // Fonction pour gérer la navigation vers le profil d'un utilisateur
  const handleProfileClick = (userId: string) => {
    navigate(`/profile/${userId}`);
  };
  
  // Fonction pour jouer une piste
  const handlePlayTrack = (match: any) => {
    if (!match.track || !match.track.presigned_url) {
      console.error("URL audio manquante pour la piste", match.track);
      return;
    }
    
    const trackToPlay = {
      track_id: match.track.track_id,
      title: match.track.title,
      artist: match.track.artist || (userRole === 'artist' ? match.beatmaker.username : match.artist.username),
      genre: match.track.genre,
      bpm: match.track.bpm,
      cover_image: match.track.cover_image,
      presigned_url: match.track.presigned_url
    };
    
    if (currentTrack?.track_id === match.track.track_id) {
      togglePlay();
    } else {
      playTrack(trackToPlay as any);
    }
  };
  
  return (
    <View padding="2rem" className="beat-swipe-matches-page">
      <Button 
        onClick={() => navigate('/beatswipe')}
        variation="link"
        marginBottom="1rem"
      >
        <FaArrowLeft style={{ marginRight: '0.5rem' }} />
        Retour à BeatSwipe
      </Button>
      
      <Heading level={2} marginBottom="1.5rem">
        Vos Matches BeatSwipe
      </Heading>
      
      {matches.length === 0 ? (
        <Card padding="2rem" textAlign="center">
          <Heading level={4} marginBottom="1rem">Aucun match pour le moment</Heading>
          <Text marginBottom="1.5rem">
            {userRole === 'artist' 
              ? 'Vous n\'avez pas encore liké de beats. Continuez à swiper pour trouver des beats qui vous plaisent!'
              : 'Aucun artiste n\'a encore liké vos beats. Continuez à créer du contenu pour attirer plus d\'artistes!'}
          </Text>
          <Button 
            onClick={() => navigate('/beatswipe')}
            variation="primary"
          >
            {userRole === 'artist' ? 'Découvrir des beats' : 'Retour'}
          </Button>
        </Card>
      ) : (
        <div className="beat-swipe-matches-list">
          {matches.map((match) => (
            <Card key={match.match_id} className="beat-swipe-match-card">
              <Flex gap="1rem" direction={{ base: 'column', medium: 'row' }}>
                {/* Image de la piste */}
                <div className="beat-swipe-match-image">
                  <Image
                    src={match.track.cover_image || '/default-cover.jpg'}
                    alt={match.track.title}
                    width="100%"
                    height="100%"
                    style={{ objectFit: 'cover', borderRadius: '8px' }}
                  />
                  
                  {/* Bouton play */}
                  <Button
                    className="beat-swipe-match-play"
                    onClick={() => handlePlayTrack(match)}
                    variation="primary"
                  >
                    {currentTrack?.track_id === match.track.track_id && isPlaying 
                      ? <FaPause /> 
                      : <FaPlay />
                    }
                  </Button>
                </div>
                
                {/* Infos de la piste et des utilisateurs */}
                <Flex direction="column" flex="1" gap="0.75rem">
                  <Heading level={4}>
                    <FaMusic style={{ marginRight: '0.5rem' }} />
                    {match.track.title}
                  </Heading>
                  
                  <Flex gap="0.5rem" wrap="wrap">
                    <Badge variation="info">{match.track.genre}</Badge>
                    {match.track.bpm && (
                      <Badge variation="warning">{match.track.bpm} BPM</Badge>
                    )}
                  </Flex>
                  
                  <Divider marginTop="0.5rem" marginBottom="0.5rem" />
                  
                  {/* Infos du beatmaker/artiste */}
                  <Flex gap="1rem" alignItems="center">
                    <FaUser />
                    {userRole === 'artist' ? (
                      <div 
                        style={{ cursor: 'pointer' }}
                        onClick={() => handleProfileClick(match.beatmaker.user_id)}
                      >
                        <Text fontWeight="bold">Beatmaker:</Text>
                        <Text>{match.beatmaker.username}</Text>
                      </div>
                    ) : (
                      <div 
                        style={{ cursor: 'pointer' }}
                        onClick={() => handleProfileClick(match.artist.user_id)}
                      >
                        <Text fontWeight="bold">Artiste:</Text>
                        <Text>{match.artist.username}</Text>
                      </div>
                    )}
                  </Flex>
                  
                  {/* Date du match */}
                  <Text fontSize="0.8rem" color="var(--chordora-text-secondary)">
                    Match créé le {new Date(match.timestamp * 1000).toLocaleDateString()}
                  </Text>
                  
                  {/* Bouton pour contacter */}
                  <Button
                    onClick={() => {
                      // Rediriger vers la messagerie (à implémenter dans une autre fonctionnalité)
                      alert('La fonctionnalité de messagerie sera disponible prochainement!');
                    }}
                    variation="primary"
                    marginTop="0.5rem"
                  >
                    <FaComment style={{ marginRight: '0.5rem' }} />
                    {userRole === 'artist' 
                      ? 'Contacter le beatmaker' 
                      : 'Répondre à l\'artiste'
                    }
                  </Button>
                </Flex>
              </Flex>
            </Card>
          ))}
        </div>
      )}
    </View>
  );
};

export default BeatSwipeMatches;