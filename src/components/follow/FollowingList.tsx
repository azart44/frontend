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
import { getFollowing } from '../../api/follow';
import FollowButton from './FollowButton';

interface FollowingListProps {
  userId: string;
  title?: string;
}

/**
 * Composant affichant la liste des utilisateurs suivis par un utilisateur
 */
const FollowingList: React.FC<FollowingListProps> = ({
  userId,
  title = 'Abonnements'
}) => {
  const navigate = useNavigate();
  const [following, setFollowing] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Charger les abonnements au montage et quand userId change
  useEffect(() => {
    const loadFollowing = async () => {
      if (!userId) {
        setIsLoading(false);
        return;
      }
      
      try {
        setIsLoading(true);
        setError(null);
        const response = await getFollowing(userId);
        
        // Vérification sécurisée des données reçues
        if (response && response.data && Array.isArray(response.data.following)) {
          setFollowing(response.data.following);
        } else {
          // Si response.data.following n'est pas un tableau, initialiser avec un tableau vide
          console.warn('Données de following invalides reçues:', response.data);
          setFollowing([]);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des abonnements:', error);
        setError('Impossible de charger les abonnements');
        setFollowing([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadFollowing();
  }, [userId]);
  
  // Gérer le clic sur un utilisateur
  const handleUserClick = (userId: string) => {
    navigate(`/profile/${userId}`);
  };
  
  // Mettre à jour la liste après un unfollow
  const handleUnfollow = (followedId: string) => {
    // Supprimer l'utilisateur de la liste
    setFollowing(prevFollowing => 
      prevFollowing.filter(user => user.userId !== followedId)
    );
  };
  
  // Afficher un loader pendant le chargement
  if (isLoading) {
    return (
      <Flex justifyContent="center" padding="2rem">
        <Loader size="large" />
      </Flex>
    );
  }
  
  // Afficher un message si aucun abonnement
  if (!following || following.length === 0) {
    return (
      <View padding="1rem">
        <Heading level={4} marginBottom="1rem">{title}</Heading>
        <Card padding="2rem" textAlign="center">
          <Text>Aucun abonnement pour le moment</Text>
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
        {following.map(user => (
          <Card key={user.userId} padding="1rem">
            <Flex alignItems="center" gap="1rem">
              <Image
                src={user.profileImageUrl || '/default-profile.jpg'}
                alt={user.username || 'Utilisateur'}
                height="50px"
                width="50px"
                style={{ 
                  objectFit: 'cover',
                  borderRadius: '50%',
                  cursor: 'pointer'
                }}
                onClick={() => handleUserClick(user.userId)}
                onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                  const target = e.currentTarget;
                  target.src = '/default-profile.jpg';
                }}
              />
              
              <Flex direction="column" flex="1">
                <Text 
                  fontWeight="bold" 
                  style={{ cursor: 'pointer' }}
                  onClick={() => handleUserClick(user.userId)}
                >
                  {user.username || `Utilisateur_${user.userId.substring(0, 6)}`}
                </Text>
                {user.userType && (
                  <Text fontSize="0.8rem" color="gray">
                    {user.userType}
                  </Text>
                )}
              </Flex>
              
              <FollowButton 
                targetUserId={user.userId}
                onFollowChange={(isFollowing) => {
                  if (!isFollowing) {
                    handleUnfollow(user.userId);
                  }
                }}
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

export default FollowingList;