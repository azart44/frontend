import React, { useState } from 'react';
import { 
  Flex, 
  Text, 
  Image, 
  Badge, 
  Button 
} from '@aws-amplify/ui-react';
import { useNavigate } from 'react-router-dom';
import { FaUserPlus, FaUserCheck } from 'react-icons/fa';
import { useFollowUser, useUnfollowUser } from '../../hooks/useFollow';

interface UserItemProps {
  user: {
    userId: string;
    username?: string;
    profileImageUrl?: string;
    userType?: string;
    isFollowing?: boolean;
  };
  onFollowToggle?: (userId: string, isFollowing: boolean) => void;
  onFollowStateChange?: () => void;
}

const UserItem: React.FC<UserItemProps> = ({ 
  user, 
  onFollowToggle, 
  onFollowStateChange 
}) => {
  const navigate = useNavigate();
  const [isFollowing, setIsFollowing] = useState(user.isFollowing || false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Utiliser les hooks de mutation pour follow/unfollow
  const followMutation = useFollowUser();
  const unfollowMutation = useUnfollowUser();
  
  // Rediriger vers le profil de l'utilisateur
  const handleUserClick = () => {
    navigate(`/profile/${user.userId}`);
  };
  
  // Gérer le clic sur le bouton Suivre/Ne plus suivre
  const handleFollowClick = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Éviter la propagation vers le parent
    
    setIsLoading(true);
    
    try {
      if (isFollowing) {
        // Appeler l'API pour unfollow
        await unfollowMutation.mutateAsync(user.userId);
        setIsFollowing(false);
        
        // Notifier le parent si nécessaire
        if (onFollowToggle) {
          onFollowToggle(user.userId, false);
        }
      } else {
        // Appeler l'API pour follow
        await followMutation.mutateAsync(user.userId);
        setIsFollowing(true);
        
        // Notifier le parent si nécessaire
        if (onFollowToggle) {
          onFollowToggle(user.userId, true);
        }
      }
      
      // Notifier que l'état de suivi a changé
      if (onFollowStateChange) {
        onFollowStateChange();
      }
    } catch (error) {
      console.error("Erreur lors du suivi/désabonnement:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Flex 
      padding="0.75rem" 
      alignItems="center" 
      justifyContent="space-between"
      style={{ cursor: 'pointer' }}
      onClick={handleUserClick}
    >
      <Flex alignItems="center" gap="1rem">
        <Image
          src={user.profileImageUrl || '/default-profile.jpg'}
          alt={user.username || 'Utilisateur'}
          width="50px"
          height="50px"
          style={{ 
            objectFit: 'cover',
            borderRadius: '50%' 
          }}
          onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
            e.currentTarget.src = '/default-profile.jpg';
          }}
        />
        
        <Flex direction="column">
          <Text fontWeight="bold">{user.username || `User_${user.userId.substring(0, 6)}`}</Text>
          {user.userType && (
            <Badge variation="info" size="small">{user.userType}</Badge>
          )}
        </Flex>
      </Flex>
      
      <Button
        onClick={handleFollowClick}
        isLoading={isLoading}
        variation={isFollowing ? "menu" : "primary"}
        size="small"
        style={{ 
          borderRadius: '20px',
          backgroundColor: isFollowing ? 'rgba(255, 255, 255, 0.1)' : 'var(--chordora-primary)'
        }}
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
    </Flex>
  );
};

export default UserItem;