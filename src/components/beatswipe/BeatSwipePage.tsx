import React, { useEffect } from 'react';
import { 
  View, 
  Heading, 
  Text, 
  Button, 
  Flex, 
  Loader, 
  Card 
} from '@aws-amplify/ui-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { FaSyncAlt, FaInfoCircle } from 'react-icons/fa';
import BeatSwipeCard from './BeatSwipeCard';
import { useSwipeRecommendations, useLocalSwipeQueue } from '../../hooks/useBeatSwipe';
import './BeatSwipePage.css';

const BeatSwipePage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, userId, userProfile } = useAuth();
  
  // Récupérer les recommandations
  const { 
    data: recommendationsData, 
    isLoading: isLoadingRecommendations, 
    error: recommendationsError,
    refetch: refetchRecommendations
  } = useSwipeRecommendations();
  
  // Utiliser le hook de gestion locale de la queue
  const {
    trackQueue,
    currentTrack,
    addTracksToQueue,
    handleSwipeRight,
    handleSwipeLeft,
    handleSwipeDown,
    isActionLoading,
    resetQueue,
    hasMoreTracks
  } = useLocalSwipeQueue();
  
  // Charger les recommandations initiales dans la queue
  useEffect(() => {
    if (recommendationsData?.tracks && recommendationsData.tracks.length > 0) {
      addTracksToQueue(recommendationsData.tracks);
    }
  }, [recommendationsData, addTracksToQueue]);
  
  // Vérifier si l'utilisateur est authentifié et est un artiste
  if (!isAuthenticated) {
    return (
      <View padding="2rem">
        <Card padding="2rem" textAlign="center">
          <Heading level={3} marginBottom="1rem">Connexion requise</Heading>
          <Text marginBottom="1.5rem">
            Vous devez être connecté pour accéder à BeatSwipe.
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
  
  // Vérifier si l'utilisateur est un artiste
  const userType = userProfile?.userType?.toLowerCase();
  const isArtistUser = userType === 'rappeur';
  
  if (!isArtistUser) {
    return (
      <View padding="2rem">
        <Card padding="2rem" textAlign="center">
          <Heading level={3} marginBottom="1rem">Accès limité</Heading>
          <Text marginBottom="1.5rem">
            BeatSwipe est uniquement disponible pour les artistes. 
            Votre profil est configuré en tant que {userProfile?.userType || 'utilisateur'}.
          </Text>
          <Button 
            onClick={() => navigate('/profile')}
            variation="primary"
          >
            Retour au profil
          </Button>
        </Card>
      </View>
    );
  }
  
  // Afficher un chargement pendant le chargement initial
  if (isLoadingRecommendations && !hasMoreTracks) {
    return (
      <View padding="2rem">
        <Flex direction="column" alignItems="center" gap="1rem">
          <Loader size="large" />
          <Text>Chargement des recommandations...</Text>
        </Flex>
      </View>
    );
  }
  
  // Gérer l'erreur de chargement
  if (recommendationsError && !hasMoreTracks) {
    return (
      <View padding="2rem">
        <Card padding="2rem" textAlign="center">
          <Heading level={3} marginBottom="1rem">Erreur de chargement</Heading>
          <Text marginBottom="1.5rem">
            Une erreur est survenue lors du chargement des recommandations.
          </Text>
          <Button 
            onClick={() => refetchRecommendations()}
            variation="primary"
          >
            <FaSyncAlt style={{ marginRight: '0.5rem' }} />
            Réessayer
          </Button>
        </Card>
      </View>
    );
  }
  
  // Afficher un message s'il n'y a pas de recommandations
  if (!hasMoreTracks && (!recommendationsData?.tracks || recommendationsData.tracks.length === 0)) {
    return (
      <View padding="2rem">
        <Card padding="2rem" textAlign="center">
          <Heading level={3} marginBottom="1rem">Pas de recommandations</Heading>
          <Text marginBottom="1.5rem">
            Il n'y a pas de nouvelles recommandations pour le moment. 
            Revenez plus tard pour découvrir de nouveaux beats.
          </Text>
          <Button 
            onClick={() => refetchRecommendations()}
            variation="primary"
          >
            <FaSyncAlt style={{ marginRight: '0.5rem' }} />
            Actualiser
          </Button>
        </Card>
      </View>
    );
  }
  
  return (
    <View className="beat-swipe-page">
      <Heading level={2} textAlign="center" marginBottom="1rem">
        BeatSwipe
      </Heading>
      
      <Text textAlign="center" marginBottom="2rem" className="beat-swipe-instruction">
        <FaInfoCircle style={{ marginRight: '0.5rem' }} />
        Glissez à droite pour liker, à gauche pour passer, ou vers le bas pour ajouter aux favoris
      </Text>
      
      <div className="beat-swipe-deck-container">
        {/* Afficher la carte courante */}
        {currentTrack && (
          <BeatSwipeCard
            track={currentTrack}
            onSwipeRight={handleSwipeRight}
            onSwipeLeft={handleSwipeLeft}
            onSwipeDown={handleSwipeDown}
            isActionLoading={isActionLoading}
          />
        )}
        
        {/* Message pour rafraîchir si plus de pistes */}
        {!hasMoreTracks && (
          <div className="beat-swipe-empty">
            <Text marginBottom="1rem">Vous avez parcouru toutes les recommandations!</Text>
            <Button 
              onClick={() => {
                resetQueue();
                refetchRecommendations();
              }}
              variation="primary"
            >
              <FaSyncAlt style={{ marginRight: '0.5rem' }} />
              Rafraîchir les recommandations
            </Button>
          </div>
        )}
      </div>
      
      {/* Bouton pour voir les matches */}
      <div className="beat-swipe-matches-link">
        <Button
          onClick={() => navigate('/beatswipe/matches')}
          variation="link"
        >
          Voir mes matches
        </Button>
      </div>
    </View>
  );
};

export default BeatSwipePage;