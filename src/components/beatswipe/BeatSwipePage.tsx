import React, { useEffect, useRef, useState } from 'react';
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
import { FaSyncAlt, FaInfoCircle, FaArrowLeft, FaBell } from 'react-icons/fa';
import BeatSwipeCard from './BeatSwipeCard';
import { useSwipeRecommendations, useLocalSwipeQueue, useSwipeMatches } from '../../hooks/useBeatSwipe';
import './BeatSwipePage.css';

const BeatSwipePage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, userId, userProfile } = useAuth();
  const [loadingMore, setLoadingMore] = useState(false);
  
  // Récupérer les recommandations
  const { 
    data: recommendationsData, 
    isLoading: isLoadingRecommendations, 
    error: recommendationsError,
    refetch: refetchRecommendations
  } = useSwipeRecommendations();
  
  // Récupérer les matches pour l'indicateur
  const { 
    data: matchesData
  } = useSwipeMatches();
  
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
    hasMoreTracks,
    currentIndex
  } = useLocalSwipeQueue();
  
  // Naviguer de façon sécurisée
  const safeNavigate = (path: string) => {
    setTimeout(() => navigate(path), 10);
  };
  
  // Charger les recommandations initiales dans la queue
  useEffect(() => {
    if (recommendationsData?.tracks && recommendationsData.tracks.length > 0) {
      console.log("Ajout de nouvelles pistes à la queue:", recommendationsData.tracks.length);
      addTracksToQueue(recommendationsData.tracks);
      setLoadingMore(false);
    }
  }, [recommendationsData, addTracksToQueue]);
  
  // Effet pour charger automatiquement plus de pistes quand on approche de la fin
  useEffect(() => {
    // Si nous avons moins de 5 pistes restantes, charger plus de recommandations
    if (trackQueue.length > 0 && currentIndex >= trackQueue.length - 5 && !loadingMore) {
      console.log("Approche de la fin de la queue (position", currentIndex, "sur", trackQueue.length, ")");
      setLoadingMore(true);
      refetchRecommendations();
    }
  }, [currentIndex, trackQueue.length, refetchRecommendations, loadingMore]);
  
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
            onClick={() => safeNavigate('/auth')}
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
            onClick={() => safeNavigate('/profile')}
            variation="primary"
          >
            Retour au profil
          </Button>
        </Card>
      </View>
    );
  }
  
  // Afficher un chargement pendant le chargement initial
  if (isLoadingRecommendations && trackQueue.length === 0) {
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
  if (recommendationsError && trackQueue.length === 0) {
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
  if (!hasMoreTracks && trackQueue.length === 0) {
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
  
  // Nombre de matches disponibles
  const matchesCount = matchesData?.matches?.length || 0;
  
  // Handler pour la navigation
  const handleNavigation = (path: string) => (e: React.MouseEvent) => {
    e.stopPropagation();
    safeNavigate(path);
  };
  
  return (
    <View className="beat-swipe-page">
      {/* Bouton de retour en haut de page */}
      <Button 
        onClick={handleNavigation('/')}
        variation="link"
        marginBottom="1rem"
        className="beat-swipe-back-button"
      >
        <FaArrowLeft style={{ marginRight: '0.5rem' }} />
        Retour à l'accueil
      </Button>
      
      <Heading level={2} textAlign="center" marginBottom="1rem">
        BeatSwipe
      </Heading>
      
      <Text textAlign="center" marginBottom="2rem" className="beat-swipe-instruction">
        <FaInfoCircle style={{ marginRight: '0.5rem' }} />
        Glissez à droite pour liker, à gauche pour passer, ou vers le bas pour ajouter aux favoris
      </Text>
      
      <div className="beat-swipe-deck-container">
        {/* Carte courante */}
        {currentTrack && (
          <BeatSwipeCard
            track={currentTrack}
            onSwipeRight={handleSwipeRight}
            onSwipeLeft={handleSwipeLeft}
            onSwipeDown={handleSwipeDown}
            isActionLoading={isActionLoading}
          />
        )}
        
        {/* Indicateur de chargement de pistes supplémentaires */}
        {loadingMore && hasMoreTracks && (
          <div className="beat-swipe-loading-indicator">
            <Loader size="small" />
            <Text fontSize="small">Chargement de nouvelles pistes...</Text>
          </div>
        )}
        
        {/* Message pour rafraîchir si plus de pistes */}
        {!hasMoreTracks && trackQueue.length > 0 && (
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
      
      {/* Statistiques et compteurs */}
      <div className="beat-swipe-stats">
        <Text fontSize="small" color="var(--chordora-text-secondary)">
          Pistes découvertes: {currentIndex} | Pistes restantes: {trackQueue.length - currentIndex}
        </Text>
      </div>
      
      {/* Bouton pour voir les matches */}
      <div className="beat-swipe-matches-link">
        <Button
          onClick={handleNavigation('/beatswipe/matches')}
          variation="link"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          {matchesCount > 0 && (
            <span className="match-count-badge">{matchesCount}</span>
          )}
          <FaBell style={{ marginRight: '0.5rem' }} />
          Voir mes matches
        </Button>
      </div>
    </View>
  );
};

export default BeatSwipePage;