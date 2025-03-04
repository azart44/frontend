import React, { useState, useEffect } from 'react';
import { 
  View, 
  Heading, 
  Text, 
  Image, 
  Flex, 
  Loader, 
  Card, 
  Button,
  Alert
} from '@aws-amplify/ui-react';
import { useNavigate } from 'react-router-dom';
import { getFollowers, followUser, unfollowUser } from '../../api/follow';
import { FaUserPlus, FaUserCheck } from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';

interface FollowersListProps {
  userId: string;
  title?: string;
}

/**
 * Composant affichant la liste des followers d'un utilisateur
 */
const FollowersList: React.FC<FollowersListProps> = ({
  userId,
  title = 'Abonnés'
}) => {
  const navigate = useNavigate();
  const { isAuthenticated, userId: authUserId } = useAuth();
  const [followers, setFollowers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingIds, setProcessingIds] = useState<string[]>([]);
  
  // Charger les followers au montage et quand userId change
  useEffect(() => {
    const loadFollowers = async () => {
      if (!userId) return;
      
      try {
        setIsLoading(true);
        setError(null);
        const response = await getFollowers(userId);
        setFollowers(response.data.followers);
      } catch (error) {
        console.error('Erreur lors du chargement des followers:', error);
        setError('Impossible de charger les abonnés');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadFollowers();
  }, [userId]);
  
  // Gérer le clic sur un utilisateur
  const handleUserClick = (userId: string) => {
    navigate(`/profile/${userId}`);
  };
  
  // Gérer le suivi/désabonnement
  const handleFollowToggle = async (followerId: string, currentlyFollowing: boolean) => {
    if (!isAuthenticated) {
      navigate('/auth');
      return;
    }
    
    setProcessingIds(prev => [...prev, followerId]);
    
    try {
      if (currentlyFollowing) {
        await unfollowUser(followerId);
      } else {
        await followUser(followerId);
      }
      
      // Mettre à jour localement le statut de suivi
      setFollowers(prevFollowers => 
        prevFollowers.map(follower => 
          follower.userId === followerId 
            ? { ...follower, isFollowing: !currentlyFollowing } 
            : follower
        )
      );
    } catch (error) {
      console.error('Erreur lors de la modification du statut de suivi:', error);
    } finally {
      setProcessingIds(prev => prev.filter(id => id !== followerId));
    }
  };
  
  // Afficher un loader pendant le chargement
  if (isLoading) {
    return (
      <Flex justifyContent="center" padding="2rem">
        <Loader size="large" />
      </Flex>
    );
  }
  
  // Afficher un message si aucun follower
  if (followers.length === 0) {
    return (
      <View padding="1rem">
        <Heading level={4} marginBottom="1rem">{title}</Heading>
        <Card padding="2rem" textAlign="center">
          <Text>Aucun abonné pour le moment</Text>
        </Card>
      </View>
    );
  }
  
  return (
    <View padding="1rem">
      <Heading level={4} marginBottom="1rem">{title}</Heading>
      
      {error && (
        <Alert variation="error" marginBottom="1rem">
          {error}
        </Alert>
      )}
      
      <Flex direction="column" gap="0.75rem">
        {followers.map(follower => (
          <Card key={follower.userId} padding="1rem">
            <Flex alignItems="center" gap="1rem">
              <Image
                src={follower.profileImageUrl || '/default-profile.jpg'}
                alt={follower.username}
                height="50px"
                width="50px"
                style={{ 
                  objectFit: 'cover',
                  borderRadius: '50%',
                  cursor: 'pointer'
                }}
                onClick={() => handleUserClick(follower.userId)}
                onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                  const target = e.currentTarget;
                  target.src = '/default-profile.jpg';
                }}
              />
              
              <Flex direction="column" flex="1">
                <Text 
                  fontWeight="bold" 
                  style={{ cursor: 'pointer' }}
                  onClick={() => handleUserClick(follower.userId)}
                >
                  {follower.username}
                </Text>
                {follower.userType && (
                  <Text fontSize="0.8rem" color="gray">
                    {follower.userType}
                  </Text>
                )}
              </Flex>
              
              {isAuthenticated && authUserId !== follower.userId && (
                <Button 
                  onClick={() => handleFollowToggle(follower.userId, follower.isFollowing)}
                  isLoading={processingIds.includes(follower.userId)}
                  loadingText={follower.isFollowing ? "Désabonnement..." : "Abonnement..."}
                  variation={follower.isFollowing ? "default" : "primary"}
                >
                  {follower.isFollowing ? (
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
              )}
            </Flex>
          </Card>
        ))}
      </Flex>
    </View>
  );
};

export default FollowersList;