// src/components/follow/FollowButton.tsx

import React, { useState, useEffect, useCallback } from 'react';
import { Button, Loader } from '@aws-amplify/ui-react';
import { FaUserPlus, FaUserCheck } from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useFollowStatus, useFollowUser, useUnfollowUser } from '../../hooks/useFollow';

interface FollowButtonProps {
  targetUserId: string;
  onFollowChange?: (isFollowing: boolean) => void;
  size?: 'small' | 'large';
  variant?: 'primary' | 'link';
}

const FollowButton: React.FC<FollowButtonProps> = ({
  targetUserId,
  onFollowChange,
  size = 'small',
  variant = 'primary'
}) => {
  const navigate = useNavigate();
  const { isAuthenticated, userId } = useAuth();
  
  // Utiliser les hooks React Query pour une gestion optimisée et consistante
  const { data: followStatus, isLoading: isStatusLoading } = useFollowStatus(targetUserId);
  const followMutation = useFollowUser();
  const unfollowMutation = useUnfollowUser();
  
  // Vérifier si c'est le propre profil de l'utilisateur
  const isSelfProfile = userId === targetUserId;
  
  // Détecter le statut de suivi depuis les données
  const isFollowing = followStatus?.isFollowing || false;
  
  // État isProcessing pour éviter les doubles clics
  const isProcessing = followMutation.isPending || unfollowMutation.isPending;
  
  // Gestion du clic sur le bouton
  const handleFollowClick = useCallback(() => {
    if (!isAuthenticated) {
      navigate('/auth');
      return;
    }
    
    if (isProcessing) return; // Éviter les doubles clics
    
    if (isFollowing) {
      unfollowMutation.mutate(targetUserId, {
        onSuccess: () => {
          if (onFollowChange) onFollowChange(false);
        }
      });
    } else {
      followMutation.mutate(targetUserId, {
        onSuccess: () => {
          if (onFollowChange) onFollowChange(true);
        }
      });
    }
  }, [isAuthenticated, isFollowing, isProcessing, targetUserId, unfollowMutation, followMutation, navigate, onFollowChange]);

  // Ne pas afficher le bouton pour son propre profil
  if (isSelfProfile) {
    return null;
  }
  
  // Afficher un loader pendant le chargement initial
  if (isStatusLoading) {
    return <Loader size="small" />;
  }
  
  return (
    <Button
      onClick={handleFollowClick}
      isLoading={isProcessing}
      loadingText={isFollowing ? "Suppression..." : "Ajout..."}
      size={size}
      variation={variant}
      isDisabled={isProcessing}
    >
      {isFollowing ? (
        <>
          <FaUserCheck style={{ marginRight: '0.5rem' }} />
          Abonné
        </>
      ) : (
        <>
          <FaUserPlus style={{ marginRight: '0.5rem' }} />
          Suivre
        </>
      )}
    </Button>
  );
};

export default React.memo(FollowButton);  // Utiliser memo pour éviter les rendus inutiles