import React, { useState } from 'react';
import { Button, Loader } from '@aws-amplify/ui-react';
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useLikeStatus, useToggleLike } from '../../hooks/useTrackLikes';

interface LikeButtonProps {
  trackId: string;
  likesCount?: number;
  showCount?: boolean;
  size?: 'small' | 'medium' | 'large';
  isCompact?: boolean;
}

/**
 * Bouton de like stylisé pour le thème sombre
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
        style={{
          background: 'transparent',
          border: 'none',
          padding: '0.25rem',
          color: isLiked ? '#ff4081' : 'var(--chordora-text-secondary)',
          cursor: 'pointer',
          transition: 'transform 0.2s ease'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.1)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
        }}
        isLoading={toggleLikeMutation.isPending}
      >
        {isLiked ? <FaHeart size={iconSize} /> : <FaRegHeart size={iconSize} />}
      </Button>
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
          transition: 'transform 0.2s ease'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.1)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
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