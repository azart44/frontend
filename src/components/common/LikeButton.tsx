import React, { useState } from 'react';
import { Button, Text, Flex, Loader } from '@aws-amplify/ui-react';
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import { useLikeStatus, useToggleLike } from '../../hooks/useTrackLikes';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface LikeButtonProps {
  trackId: string;
  likesCount?: number;
  showCount?: boolean;
  size?: 'small' | 'medium' | 'large';
  isCompact?: boolean;
}

/**
 * Composant bouton pour liker/unliker une piste
 */
const LikeButton: React.FC<LikeButtonProps> = ({ 
  trackId, 
  likesCount = 0,
  showCount = true,
  size = 'medium',
  isCompact = false
}) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [optimisticLikesCount, setOptimisticLikesCount] = useState(likesCount);
  
  // Requêter le statut de like pour cette piste
  const { 
    data: likeStatus, 
    isLoading: isStatusLoading 
  } = useLikeStatus(trackId);
  
  // Mutation pour toggler le like
  const toggleLikeMutation = useToggleLike();
  
  // Déterminer si l'utilisateur a déjà liké cette piste
  const isLiked = likeStatus?.isLiked || false;
  
  // Gestionnaire de clic sur le bouton like
  const handleLikeClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Éviter la propagation du clic
    
    if (!isAuthenticated) {
      // Rediriger vers la page de connexion si l'utilisateur n'est pas connecté
      navigate('/auth');
      return;
    }
    
    // Mise à jour optimiste du compteur
    setOptimisticLikesCount(prev => isLiked ? Math.max(0, prev - 1) : prev + 1);
    
    // Appeler la mutation pour toggler le like
    toggleLikeMutation.mutate({ 
      trackId, 
      isLiked 
    });
  };
  
  // Taille de l'icône en fonction de la prop size
  const iconSize = size === 'small' ? 14 : size === 'large' ? 24 : 18;
  
  // Si le chargement du statut est en cours, afficher un loader
  if (isStatusLoading) {
    return <Loader size="small" />;
  }
  
  // Rendu en mode compact (juste l'icône)
  if (isCompact) {
    return (
      <Button
        onClick={handleLikeClick}
        backgroundColor="transparent"
        padding="0.5rem"
        color={isLiked ? "#ff4081" : "#a0a0a0"}
        isLoading={toggleLikeMutation.isPending}
        ariaLabel={isLiked ? "Retirer des favoris" : "Ajouter aux favoris"}
      >
        {isLiked ? <FaHeart size={iconSize} /> : <FaRegHeart size={iconSize} />}
      </Button>
    );
  }
  
  // Rendu normal avec compteur (si showCount est true)
  return (
    <Flex alignItems="center" gap="0.3rem">
      <Button
        onClick={handleLikeClick}
        backgroundColor="transparent"
        padding="0.5rem"
        color={isLiked ? "#ff4081" : "#a0a0a0"}
        isLoading={toggleLikeMutation.isPending}
        ariaLabel={isLiked ? "Retirer des favoris" : "Ajouter aux favoris"}
        display="flex"
        alignItems="center"
        gap="0.3rem"
      >
        {isLiked ? <FaHeart size={iconSize} /> : <FaRegHeart size={iconSize} />}
        {showCount && (
          <Text fontSize={size === 'small' ? '0.8rem' : '0.9rem'} color="#a0a0a0">
            {optimisticLikesCount}
          </Text>
        )}
      </Button>
    </Flex>
  );
};

export default React.memo(LikeButton);