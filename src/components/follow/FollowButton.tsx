import React, { useState, useEffect } from 'react';
import { Button, Loader } from '@aws-amplify/ui-react';
import { FaUserPlus, FaUserCheck } from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { followUser, unfollowUser, getFollowStatus } from '../../api/follow';

interface FollowButtonProps {
  targetUserId: string;
  onFollowChange?: (isFollowing: boolean) => void;
  size?: 'small' | 'large';  // Suppression de 'medium'
  variant?: 'primary' | 'link'; // Changé 'outline' en 'link'
}

/**
 * Bouton pour suivre/ne plus suivre un utilisateur
 */
const FollowButton: React.FC<FollowButtonProps> = ({
  targetUserId,
  onFollowChange,
  size = 'small',
  variant = 'primary'
}) => {
  const navigate = useNavigate();
  const { isAuthenticated, userId } = useAuth();
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  // Ne pas afficher le bouton pour son propre profil
  if (userId === targetUserId) {
    return null;
  }
  
  // Vérifier le statut de suivi au chargement
  useEffect(() => {
    const checkFollowStatus = async () => {
      if (!isAuthenticated || !userId) {
        setIsLoading(false);
        return;
      }
      
      try {
        setIsLoading(true);
        setErrorMsg(null);
        const response = await getFollowStatus(targetUserId);
        setIsFollowing(response.data.isFollowing);
      } catch (error) {
        console.error('Erreur lors de la vérification du statut de suivi:', error);
        setErrorMsg('Impossible de vérifier le statut de suivi');
      } finally {
        setIsLoading(false);
      }
    };
    
    checkFollowStatus();
  }, [isAuthenticated, userId, targetUserId]);
  
  // Gestion du clic sur le bouton
  const handleFollowClick = async () => {
    if (!isAuthenticated) {
      navigate('/auth');
      return;
    }
    
    try {
      setIsProcessing(true);
      setErrorMsg(null);
      
      if (isFollowing) {
        await unfollowUser(targetUserId);
        setIsFollowing(false);
      } else {
        await followUser(targetUserId);
        setIsFollowing(true);
      }
      
      // Notifier le parent si nécessaire
      if (onFollowChange) {
        onFollowChange(!isFollowing);
      }
    } catch (error) {
      console.error('Erreur lors du changement de statut de suivi:', error);
      setErrorMsg('Erreur lors du traitement de votre demande');
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Afficher un loader pendant le chargement initial
  if (isLoading) {
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

export default FollowButton;