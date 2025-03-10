import React, { useState } from 'react';
import { Button, Loader } from '@aws-amplify/ui-react';
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useLikeStatus, useToggleLike } from '../../hooks/useTrackLikes';

interface LikeButtonProps {
  trackId: string;
  likesCount?: number;
  showCount?: boolean;
  size?: 'small' | 'medium' | 'large';
  isCompact?: boolean;
}

/**
 * Bouton de like stylisé pour le thème sombre avec animation
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
  const [isAnimating, setIsAnimating] = useState(false);
  
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
    
    // Animation
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 300);
    
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
  
  // Couleur du cœur  
  const heartColor = isLiked ? '#ff4081' : (isCompact ? 'white' : '#a0a0a0');
  
  // Style d'animation
  const animationStyle = isAnimating 
    ? { 
        transform: isLiked ? 'scale(0.8)' : 'scale(1.2)',
        transition: 'transform 0.2s ease' 
      } 
    : { 
        transform: 'scale(1)',
        transition: 'transform 0.2s ease' 
      };
  
  // Si le chargement du statut est en cours, afficher un loader
  if (isStatusLoading) {
    return <Loader size="small" />;
  }
  
  // Rendu en mode compact (juste l'icône)
  if (isCompact) {
    return (
      <div
        onClick={handleLikeClick}
        style={{
          cursor: 'pointer',
          ...animationStyle
        }}
      >
        {isLiked ? (
          <FaHeart size={iconSize} color={heartColor} />
        ) : (
          <FaRegHeart size={iconSize} color={heartColor} />
        )}
      </div>
    );
  }
  
  // Rendu normal avec compteur (si showCount est true)
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
      <Button
        onClick={handleLikeClick}
        style={{
          background: 'transparent',
          border: 'none',
          padding: '0.5rem',
          color: isLiked ? '#ff4081' : 'var(--chordora-text-secondary)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '0.3rem',
          ...animationStyle
        }}
        isLoading={toggleLikeMutation.isPending}
      >
        {isLiked ? <FaHeart size={iconSize} /> : <FaRegHeart size={iconSize} />}
        {showCount && (
          <span style={{ 
            fontSize: size === 'small' ? '0.8rem' : '0.9rem',
            color: 'var(--chordora-text-secondary)'
          }}>
            {optimisticLikesCount}
          </span>
        )}
      </Button>
    </div>
  );
};

export default React.memo(LikeButton);