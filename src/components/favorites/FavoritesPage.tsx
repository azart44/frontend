import React, { useEffect } from 'react';
import { 
  View, 
  Heading, 
  Text, 
  Flex, 
  Loader, 
  Alert,
  Button,
  Badge,
  Card
} from '@aws-amplify/ui-react';
import { useNavigate } from 'react-router-dom';
import { useUserFavorites } from '../../hooks/useTrackFavorites';
import { useAuth } from '../../contexts/AuthContext';
import { useAudioContext } from '../../contexts/AudioContext';
import TrackCard from '../track/TrackCard';
import { FaStar, FaBug, FaSync } from 'react-icons/fa';
import { Track } from '../../types/TrackTypes';

const FavoritesPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, userId } = useAuth();
  const { playTrack } = useAudioContext();
  
  const { 
    data: favoritesData, 
    isLoading, 
    error, 
    refetch 
  } = useUserFavorites();
  
  // Débogage: Afficher des informations utiles dans la console
  useEffect(() => {
    console.log('Rendu FavoritesPage avec état:', {
      isAuthenticated,
      userId,
      isLoading,
      error,
      favoritesData
    });
    
    if (error) {
      console.error('Erreur détaillée:', error);
    }
    
    if (favoritesData) {
      console.log('Données des favoris:', favoritesData);
    }
  }, [isAuthenticated, userId, isLoading, error, favoritesData]);
  
  if (!isAuthenticated) {
    return (
      <View padding="2rem">
        <Alert variation="warning" heading="Connexion requise">
          Veuillez vous connecter pour accéder à vos favoris.
        </Alert>
        <Button
          onClick={() => navigate('/auth')}
          variation="primary"
          marginTop="1rem"
        >
          Se connecter
        </Button>
      </View>
    );
  }
  
  if (isLoading) {
    return (
      <Flex justifyContent="center" padding="2rem">
        <Loader size="large" />
      </Flex>
    );
  }
  
  if (error) {
    return (
      <View padding="2rem">
        <Alert variation="error" heading="Erreur">
          Une erreur est survenue lors du chargement de vos favoris.
          <Text>{String(error)}</Text>
        </Alert>
        <Button 
          onClick={() => refetch()} 
          variation="primary"
          marginTop="1rem"
        >
          <FaSync style={{ marginRight: '0.5rem' }} />
          Réessayer
        </Button>
        
        {/* Bouton pour voir les requêtes réseau */}
        <Button 
          onClick={() => console.log('Inspectez le Network dans les DevTools')} 
          variation="menu"
          marginTop="1rem"
          marginLeft="1rem"
        >
          <FaBug style={{ marginRight: '0.5rem' }} />
          Débogage
        </Button>
      </View>
    );
  }
  
  const favoriteTracks = favoritesData?.favoriteTracks || [];
  const totalFavorites = favoritesData?.totalFavorites || 0;
  
  if (favoriteTracks.length === 0) {
    return (
      <View padding="2rem">
        <Heading level={2} marginBottom="1rem">
          <Flex alignItems="center" gap="0.5rem">
            <FaStar color="#FFD700" />
            <Text>Mes Favoris</Text>
          </Flex>
        </Heading>
        
        <View 
          backgroundColor="#2a2d36" 
          padding="2rem" 
          textAlign="center"
          borderRadius="8px"
        >
          <Heading level={4} marginBottom="1rem">
            Vous n'avez pas encore de favoris
          </Heading>
          <Text marginBottom="1.5rem">
            Explorez nos pistes et ajoutez celles que vous aimez à vos favoris.
          </Text>
          <Flex gap="1rem" justifyContent="center">
            <Button 
              onClick={() => navigate('/tracks')} 
              variation="primary"
            >
              Explorer les pistes
            </Button>
            
            <Button 
              onClick={() => refetch()} 
              variation="menu"
            >
              <FaSync style={{ marginRight: '0.5rem' }} />
              Actualiser
            </Button>
          </Flex>
        </View>
      </View>
    );
  }
  
  return (
    <View padding="2rem">
      <Flex justifyContent="space-between" alignItems="center" marginBottom="1rem">
        <Heading level={2}>
          <Flex alignItems="center" gap="0.5rem">
            <FaStar color="#FFD700" />
            <Text>Mes Favoris</Text>
            <Badge backgroundColor="#FFD700" color="white" borderRadius="10px">
              {totalFavorites}
            </Badge>
          </Flex>
        </Heading>
        
        <Button
          onClick={() => refetch()}
          variation="menu"
        >
          <FaSync style={{ marginRight: '0.5rem' }} />
          Actualiser
        </Button>
      </Flex>
      
      <Card padding="0" backgroundColor="var(--chordora-card-bg)" borderRadius="8px">
        {favoriteTracks.map((track: Track, index: number) => (
          <React.Fragment key={track.track_id}>
            <TrackCard 
              track={{...track, position: index + 1}}
              onPlay={() => playTrack(track)}
              showFavoriteButton
              isInFavorites
              displayStyle="row"
            />
            {index < favoriteTracks.length - 1 && (
              <div style={{ 
                height: '1px', 
                backgroundColor: 'var(--chordora-divider)',
                margin: '0 1rem'
              }} />
            )}
          </React.Fragment>
        ))}
      </Card>
    </View>
  );
};

export default FavoritesPage;