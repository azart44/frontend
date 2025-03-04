import React, { useState, useEffect } from 'react';
import { 
  View, 
  Heading, 
  Text, 
  Image, 
  Flex, 
  Loader, 
  Card, 
  Alert
} from '@aws-amplify/ui-react';
import { useNavigate } from 'react-router-dom';
import { getFollowers } from '../../api/follow';
import FollowButton from './FollowButton';

interface FollowersListProps {
  userId: string;
  title?: string;
}

const FollowersList: React.FC<FollowersListProps> = ({
  userId,
  title = 'Abonnés'
}) => {
  const navigate = useNavigate();
  const [followers, setFollowers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Charger les followers au montage et quand userId change
  useEffect(() => {
    const loadFollowers = async () => {
      if (!userId) {
        setIsLoading(false);
        return;
      }
      
      try {
        setIsLoading(true);
        setError(null);
        const response = await getFollowers(userId);
        
        // Vérification sécurisée des données reçues
        if (response && response.data && Array.isArray(response.data.followers)) {
          setFollowers(response.data.followers);
        } else {
          // Si response.data.followers n'est pas un tableau, initialiser avec un tableau vide
          console.warn('Données de followers invalides reçues:', response.data);
          setFollowers([]);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des followers:', error);
        setError('Impossible de charger les abonnés');
        setFollowers([]);
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
  
  // Afficher un loader pendant le chargement
  if (isLoading) {
    return (
      <Flex justifyContent="center" padding="2rem">
        <Loader size="large" />
      </Flex>
    );
  }
  
  // Afficher un message si aucun follower
  if (!followers || followers.length === 0) {
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
                alt={follower.username || 'Utilisateur'}
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
                  {follower.username || `Utilisateur_${follower.userId.substring(0, 6)}`}
                </Text>
                {follower.userType && (
                  <Text fontSize="0.8rem" color="gray">
                    {follower.userType}
                  </Text>
                )}
              </Flex>
              
              <FollowButton 
                targetUserId={follower.userId}
                size="small"
                variant="link"
              />
            </Flex>
          </Card>
        ))}
      </Flex>
    </View>
  );
};

export default FollowersList;