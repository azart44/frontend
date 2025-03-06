import React, { useState } from 'react';
import { 
  Text, 
  Flex, 
  Button, 
  Image, 
  Badge 
} from '@aws-amplify/ui-react';
import { useNavigate } from 'react-router-dom';
import { FaUserPlus, FaUserCheck } from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';

interface User {
  userId: string;
  username?: string;
  name?: string;
  profileImageUrl?: string;
  profileImage?: string; // Alternative field name
  userType?: string;
  followDate?: number;
  isFollowing?: boolean;
}

interface UserItemProps {
  user: User;
  onFollowToggle?: (userId: string, isFollowing: boolean) => void;
  hideFollowButton?: boolean;
}

/**
 * Composant pour afficher un utilisateur dans les listes de followers/following
 * avec gestion du bouton de suivi/désabonnement
 */
const UserItem: React.FC<UserItemProps> = ({ 
  user, 
  onFollowToggle,
  hideFollowButton = false
}) => {
  const navigate = useNavigate();
  const { userId: authUserId, isAuthenticated } = useAuth();
  const [isHovered, setIsHovered] = useState(false);
  const [isFollowHovered, setIsFollowHovered] = useState(false);
  
  // Déterminer si c'est le propre profil de l'utilisateur authentifié
  const isSelf = user.userId === authUserId;
  
  // Déterminer l'état de suivi
  const isFollowing = user.isFollowing || false;
  
  // URL de l'image de profil (avec fallback)
  const profileImageUrl = user.profileImageUrl || user.profileImage || '/default-profile.jpg';
  
  // Gérer le clic sur le profil
  const handleProfileClick = () => {
    navigate(`/profile/${user.userId}`);
  };
  
  // Gérer le clic sur le bouton suivre/ne plus suivre
  const handleFollowClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      navigate('/auth');
      return;
    }
    
    if (onFollowToggle) {
      onFollowToggle(user.userId, isFollowing);
    }
  };
  
  // Formatter la date de suivi
  const formatFollowDate = (timestamp?: number): string => {
    if (!timestamp) return '';
    
    const date = new Date(timestamp);
    return date.toLocaleDateString();
  };
  
  return (
    <Flex 
      alignItems="center" 
      gap="1rem" 
      padding="1rem"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ 
        cursor: 'pointer',
        transition: 'background-color 0.2s ease',
        backgroundColor: isHovered ? 'var(--chordora-hover-bg)' : 'transparent',
        borderRadius: '8px'
      }}
      onClick={handleProfileClick}
    >
      {/* Photo de profil */}
      <Image
        src={profileImageUrl}
        alt={user.username || user.name || 'Utilisateur'}
        width="50px"
        height="50px"
        style={{ 
          objectFit: 'cover',
          borderRadius: '50%'
        }}
        onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
          const target = e.currentTarget;
          target.src = '/default-profile.jpg';
        }}
      />
      
      {/* Informations utilisateur */}
      <Flex direction="column" flex="1">
        <Text fontWeight="bold">
          {user.username || user.name || `Utilisateur_${user.userId.substring(0, 6)}`}
        </Text>
        
        <Flex gap="0.5rem" alignItems="center">
          {user.userType && (
            <Badge variation="info" size="small">
              {user.userType}
            </Badge>
          )}
          
          {user.followDate && (
            <Text fontSize="0.8rem" color="var(--chordora-text-secondary)">
              Depuis {formatFollowDate(user.followDate)}
            </Text>
          )}
        </Flex>
      </Flex>
      
      {/* Bouton suivre/ne plus suivre */}
      {!hideFollowButton && !isSelf && (
        <Button
          onMouseEnter={() => setIsFollowHovered(true)}
          onMouseLeave={() => setIsFollowHovered(false)}
          onClick={handleFollowClick}
          variation={isFollowing ? "menu" : "primary"}
          size="small"
          style={{ 
            borderRadius: '20px',
            backgroundColor: isFollowing 
              ? 'rgba(255, 255, 255, 0.1)' 
              : 'var(--chordora-primary)',
            minWidth: isFollowHovered && isFollowing ? '110px' : 'auto'
          }}
        >
          {isFollowing ? (
            isFollowHovered ? (
              'Ne plus suivre'
            ) : (
              <>
                <FaUserCheck style={{ marginRight: '0.5rem' }} />
                Abonné
              </>
            )
          ) : (
            <>
              <FaUserPlus style={{ marginRight: '0.5rem' }} />
              Suivre
            </>
          )}
        </Button>
      )}
    </Flex>
  );
};

export default UserItem;