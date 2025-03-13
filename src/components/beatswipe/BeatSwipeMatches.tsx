import React, { useState, useEffect } from 'react';
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
  Divider,
  Alert
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
  FaSyncAlt,
  FaBug
} from 'react-icons/fa';
import './BeatSwipeMatches.css';

const BeatSwipeMatches: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, userProfile } = useAuth();
  const { currentTrack, isPlaying, togglePlay, playTrack } = useAudioContext();
  
  // État pour gérer les erreurs d'image
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  // État pour les logs de débogage
  const [debugLogs, setDebugLogs] = useState<string[]>([]);
  // État pour afficher/cacher les logs de débogage
  const [showDebug, setShowDebug] = useState(false);
  
  // Récupérer les matches
  const { 
    data: matchesData, 
    isLoading, 
    error,
    refetch 
  } = useSwipeMatches();

  // Effect pour consigner les données reçues pour le débogage
  useEffect(() => {
    if (matchesData) {
      setDebugLogs(prev => [
        ...prev, 
        `Matches reçus: ${matchesData.count}`,
        `Premier match sample: ${JSON.stringify(matchesData.matches[0] || {}, null, 2).substring(0, 300)}...`
      ]);
    }
    if (error) {
      setDebugLogs(prev => [...prev, `Erreur: ${String(error)}`]);
    }
  }, [matchesData, error]);
  
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
          <Flex direction="column" gap="1rem">
            <Button 
              onClick={() => refetch()}
              variation="primary"
            >
              <FaSyncAlt style={{ marginRight: '0.5rem' }} />
              Réessayer
            </Button>
            
            <Button
              onClick={() => setShowDebug(!showDebug)}
              variation="link"
            >
              <FaBug style={{ marginRight: '0.5rem' }} />
              {showDebug ? 'Cacher' : 'Afficher'} les informations de débogage
            </Button>
            
            {showDebug && (
              <Alert variation="warning">
                <pre style={{ whiteSpace: 'pre-wrap', overflow: 'auto', maxHeight: '200px' }}>
                  {String(error)}
                </pre>
              </Alert>
            )}
          </Flex>
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
  
  // Fonction pour jouer une piste avec gestion robuste des données
  const handlePlayTrack = (match: any) => {
    try {
      // Vérification et logging des données de la piste
      if (!match.track) {
        console.error("Objet track manquant dans le match", match);
        setDebugLogs(prev => [...prev, `Erreur: Objet track manquant dans le match ${match.match_id || 'inconnu'}`]);
        return;
      }
      
      if (!match.track.presigned_url) {
        console.error("URL audio manquante pour la piste", match.track);
        setDebugLogs(prev => [...prev, `Erreur: URL audio manquante pour la piste ${match.track.track_id || 'inconnue'}`]);
        
        // Utiliser une URL de secours pour les tests (à supprimer en production)
        if (process.env.NODE_ENV === 'development') {
          match.track.presigned_url = "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3";
          console.log("Utilisation d'une URL de secours pour le développement");
        } else {
          alert("Impossible de lire cette piste: URL audio manquante");
          return;
        }
      }
      
      // Log de débogage
      console.log("Données de la piste à jouer:", {
        track_id: match.track.track_id,
        title: match.track.title,
        presigned_url: match.track.presigned_url?.substring(0, 50) + "..."
      });
      
      // Construction de l'objet track pour le lecteur audio
      const trackToPlay = {
        track_id: match.track.track_id,
        title: match.track.title || "Titre inconnu",
        // Choisir le bon nom d'artiste en fonction du rôle
        artist: userRole === 'artist' 
          ? (match.beatmaker?.username || "Beatmaker") 
          : (match.artist?.username || "Artiste"),
        genre: match.track.genre || "Genre inconnu",
        bpm: match.track.bpm,
        // Utiliser l'URL présignée pour l'audio
        presigned_url: match.track.presigned_url,
        // Utiliser l'URL de l'image de couverture ou une image par défaut
        cover_image: match.track.cover_image || '/default-cover.jpg',
        // Ajouter d'autres champs utiles s'ils sont présents
        duration: match.track.duration || 0
      };
      
      // Log pour le débogage
      setDebugLogs(prev => [...prev, `Lecture: ${trackToPlay.title} (${trackToPlay.track_id})`]);
      
      // Si c'est la même piste, basculer entre lecture et pause
      if (currentTrack?.track_id === match.track.track_id) {
        togglePlay();
      } else {
        // Sinon jouer la nouvelle piste
        playTrack(trackToPlay as any);
      }
    } catch (error) {
      console.error("Erreur lors de la lecture de la piste:", error);
      setDebugLogs(prev => [...prev, `Exception: ${String(error)}`]);
      alert("Un problème est survenu lors de la lecture de cette piste.");
    }
  };
  
  // Fonction pour gérer les erreurs d'image
  const handleImageError = (trackId: string) => {
    setImageErrors(prev => ({
      ...prev,
      [trackId]: true
    }));
    setDebugLogs(prev => [...prev, `Erreur d'image pour la piste ${trackId}`]);
  };
  
  // Obtenir l'URL de l'image avec gestion des erreurs
  const getCoverImageUrl = (match: any) => {
    // Si on a déjà eu une erreur pour cette image, utiliser l'image par défaut
    if (imageErrors[match.track.track_id]) {
      return '/default-cover.jpg';
    }
    
    // Utiliser l'URL de couverture ou une image par défaut
    return match.track.cover_image || '/default-cover.jpg';
  };
  
  return (
    <View padding="2rem" className="beat-swipe-matches-page">
      <Flex direction="row" justifyContent="space-between" alignItems="center" marginBottom="1rem">
        <Button 
          onClick={() => navigate('/beatswipe')}
          variation="link"
        >
          <FaArrowLeft style={{ marginRight: '0.5rem' }} />
          Retour à BeatSwipe
        </Button>
        
        {/* Bouton de débogage */}
        <Button 
          onClick={() => setShowDebug(!showDebug)}
          variation="link"
          size="small"
        >
          <FaBug style={{ marginRight: '0.25rem' }} />
          {showDebug ? 'Cacher' : 'Debug'}
        </Button>
      </Flex>
      
      <Heading level={2} marginBottom="1.5rem">
        Vos Matches BeatSwipe
      </Heading>
      
      {/* Affichage du débogage si activé */}
      {showDebug && (
        <Card marginBottom="1.5rem" padding="1rem" backgroundColor="rgba(0,0,0,0.1)">
          <Heading level={5} marginBottom="0.5rem">Informations de débogage</Heading>
          <div style={{ maxHeight: '200px', overflow: 'auto' }}>
            {debugLogs.map((log, index) => (
              <Text key={index} fontSize="0.8rem" fontFamily="monospace">
                {log}
              </Text>
            ))}
          </div>
        </Card>
      )}
      
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
                    src={getCoverImageUrl(match)}
                    alt={match.track.title || 'Cover image'}
                    width="100%"
                    height="100%"
                    style={{ objectFit: 'cover', borderRadius: '8px' }}
                    onError={() => handleImageError(match.track.track_id)}
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
                    {match.track.title || 'Titre inconnu'}
                  </Heading>
                  
                  <Flex gap="0.5rem" wrap="wrap">
                    <Badge variation="info">{match.track.genre || 'Genre inconnu'}</Badge>
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
                        <Text>{match.beatmaker.username || 'Nom inconnu'}</Text>
                      </div>
                    ) : (
                      <div 
                        style={{ cursor: 'pointer' }}
                        onClick={() => handleProfileClick(match.artist.user_id)}
                      >
                        <Text fontWeight="bold">Artiste:</Text>
                        <Text>{match.artist.username || 'Nom inconnu'}</Text>
                      </div>
                    )}
                  </Flex>
                  
                  {/* Date du match */}
                  <Text fontSize="0.8rem" color="var(--chordora-text-secondary)">
                    Match créé le {match.timestamp ? new Date(match.timestamp * 1000).toLocaleDateString() : 'date inconnue'}
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