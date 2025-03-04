import React, { useState, useEffect } from 'react';
import { Flex, Text, Loader, Button } from '@aws-amplify/ui-react';
import { getFollowCounts } from '../../api/follow';

interface FollowStatsProps {
  userId: string;
  onShowFollowers?: () => void;
  onShowFollowing?: () => void;
}

/**
 * Composant affichant les statistiques de suivi (nombre de followers et de suivis)
 */
const FollowStats: React.FC<FollowStatsProps> = ({
  userId,
  onShowFollowers,
  onShowFollowing
}) => {
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Charger les compteurs au montage et quand userId change
  useEffect(() => {
    const loadFollowCounts = async () => {
      if (!userId) return;
      
      try {
        setIsLoading(true);
        setError(null);
        const response = await getFollowCounts(userId);
        setFollowersCount(response.data.followersCount);
        setFollowingCount(response.data.followingCount);
      } catch (error) {
        console.error('Erreur lors du chargement des statistiques de suivi:', error);
        setError('Impossible de charger les statistiques');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadFollowCounts();
  }, [userId]);
  
  // Afficher un loader pendant le chargement
  if (isLoading) {
    return (
      <Flex justifyContent="center" padding="0.5rem">
        <Loader size="small" />
      </Flex>
    );
  }
  
  // Afficher une erreur si nécessaire
  if (error) {
    return (
      <Text color="red" fontSize="0.8rem">
        {error}
      </Text>
    );
  }
  
  return (
    <Flex gap="1.5rem" margin="1rem 0">
      <Button 
        variation="link" 
        onClick={onShowFollowers}
        padding="0"
      >
        <Text fontWeight="bold">{followersCount}</Text>
        <Text marginLeft="0.25rem" color="gray">
          {followersCount === 1 ? 'abonné' : 'abonnés'}
        </Text>
      </Button>
      
      <Button 
        variation="link" 
        onClick={onShowFollowing}
        padding="0"
      >
        <Text fontWeight="bold">{followingCount}</Text>
        <Text marginLeft="0.25rem" color="gray">
          abonnements
        </Text>
      </Button>
    </Flex>
  );
};

export default FollowStats;