import React, { useState } from 'react';
import { Button, Loader } from '@aws-amplify/ui-react';
import { FaStar, FaRegStar } from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useFavoriteStatus, useToggleFavorite } from '../../hooks/useTrackFavorites';

interface FavoriteButtonProps {
  trackId: string;
  size?: 'small' | 'medium' | 'large';
  isCompact?: boolean;
}

/**
 * Bouton de favoris stylisé avec icône étoile
 */
const FavoriteButton: React.FC<FavoriteButtonProps> = ({ 
  trackId, 
  size = 'medium',
  isCompact = false
}) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  
  // Requêter le statut de favori pour cette piste
  const { 
    data: favoriteStatus, 
    isLoading: isStatusLoading 
  } = useFavoriteStatus(trackId);
  
  // Mutation pour ajouter/retirer des favoris
  const toggleFavoriteMutation = useToggleFavorite();
  
  // Déterminer si l'utilisateur a déjà ajouté cette piste aux favoris
  const isFavorite = favoriteStatus?.isFavorite || false;
  
  // Gestionnaire de clic sur le bouton favoris
  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Éviter la propagation du clic
    
    if (!isAuthenticated) {
      // Rediriger vers la page de connexion si l'utilisateur n'est pas connecté
      navigate('/auth');
      return;
    }
    
    // Appeler la mutation pour ajouter/retirer des favoris
    toggleFavoriteMutation.mutate({ 
      trackId, 
      isFavorite 
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
        onClick={handleFavoriteClick}
        style={{
          background: 'transparent',
          border: 'none',
          padding: '0.25rem',
          color: isFavorite ? '#FFD700' : 'var(--chordora-text-secondary)',
          cursor: 'pointer',
          transition: 'transform 0.2s ease'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.1)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
        }}
        isLoading={toggleFavoriteMutation.isPending}
        title={isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
      >
        {isFavorite ? <FaStar size={iconSize} /> : <FaRegStar size={iconSize} />}
      </Button>
    );
  }
  
  // Rendu normal
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
      <Button
        onClick={handleFavoriteClick}
        style={{
          background: 'transparent',
          border: 'none',
          padding: '0.5rem',
          color: isFavorite ? '#FFD700' : 'var(--chordora-text-secondary)',
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
        isLoading={toggleFavoriteMutation.isPending}
        title={isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
      >
        {isFavorite ? <FaStar size={iconSize} /> : <FaRegStar size={iconSize} />}
        <span style={{ 
          fontSize: size === 'small' ? '0.8rem' : '0.9rem',
          color: 'var(--chordora-text-secondary)'
        }}>
          {isFavorite ? 'Favori' : 'Ajouter aux favoris'}
        </span>
      </Button>
    </div>
  );
};

export default React.memo(FavoriteButton);