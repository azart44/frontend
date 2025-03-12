import React from 'react';
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
import { FaStar } from 'react-icons/fa';
import { Track } from '../../types/TrackTypes';

/**
 * Page des favoris - Affiche toutes les pistes marquées comme favorites par l'utilisateur
 */
const FavoritesPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { playTrack } = useAudioContext();
  
  // Récupérer les pistes favorites de l'utilisateur
  const { 
    data: favoritesData, 
    isLoading, 
    error, 
    refetch 
  } = useUserFavorites();
  
  // Rediriger vers la page de connexion si l'utilisateur n'est pas connecté
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
  
  // Afficher un loader pendant le chargement
  if (isLoading) {
    return (
      <Flex justifyContent="center" padding="2rem">
        <Loader size="large" />
      </Flex>
    );
  }
  
  // Gérer les erreurs
  if (error) {
    return (
      <View padding="2rem">
        <Alert variation="error" heading="Erreur">
          Une erreur est survenue lors du chargement de vos favoris.
        </Alert>
        <Button 
          onClick={() => refetch()} 
          variation="primary"
          marginTop="1rem"
        >
          Réessayer
        </Button>
      </View>
    );
  }
  
  const favoriteTracks = favoritesData?.favoriteTracks || [];
  const totalFavorites = favoritesData?.totalFavorites || 0;
  
  // Si aucune piste n'est dans les favoris
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
          <Button 
            onClick={() => navigate('/tracks')} 
            variation="primary"
          >
            Explorer les pistes
          </Button>
        </View>
      </View>
    );
  }
  
  // Afficher les pistes favorites
  return (
    <View padding="2rem">
      <Heading level={2} marginBottom="1rem">
        <Flex alignItems="center" gap="0.5rem">
          <FaStar color="#FFD700" />
          <Text>Mes Favoris</Text>
          <Badge backgroundColor="#FFD700" color="black" borderRadius="10px">
            {totalFavorites}
          </Badge>
        </Flex>
      </Heading>
      
      <Card padding="0" backgroundColor="var(--chordora-card-bg)" borderRadius="8px">
        {favoriteTracks.map((track: Track, index: number) => (
          <React.Fragment key={track.track_id}>
            {/* Utiliser le style "row" pour cohérence avec les autres vues */}
            <TrackCard 
              track={{...track, position: index + 1}}
              onPlay={() => playTrack(track)}
              showFavoriteButton
              displayStyle="row"
            />
            {/* Ajouter un séparateur entre les pistes sauf pour la dernière */}
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