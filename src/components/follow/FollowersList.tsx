import React, { useState, useEffect } from 'react';
import { 
  View, 
  Flex, 
  Loader, 
  Text,
  Divider,
  Alert
} from '@aws-amplify/ui-react';
import { getFollowing } from '../../api/follow';
import UserItem from './UserItem';

interface FollowingListProps {
  userId: string;
  title?: string;
}

/**
 * Liste des abonnements améliorée avec un design cohérent et une meilleure UX
 */
const FollowingList: React.FC<FollowingListProps> = ({
  userId,
  title
}) => {
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
  
  // Gérer le toggle du bouton suivre/abonné
  const handleFollowToggle = (followingId: string, isFollowing: boolean) => {
    // Simuler le changement d'état localement pour une UX instantanée
    if (!isFollowing) {
      // Si on vient de cliquer pour suivre
      setFollowing(prevFollowing => 
        prevFollowing.map(user => 
          user.userId === followingId 
            ? { ...user, isFollowing: true }
            : user
        )
      );
    } else {
      // Si on vient de cliquer pour ne plus suivre
      setFollowing(prevFollowing => 
        prevFollowing.filter(user => user.userId !== followingId)
      );
    }
    
    // Dans une implémentation réelle, vous appelleriez ici votre API
    // pour mettre à jour le statut de suivi
  };
  
  // Afficher un loader pendant le chargement
  if (isLoading) {
    return (
      <Flex direction="column" alignItems="center" padding="2rem">
        <Loader size="large" />
        <Text marginTop="1rem" color="var(--chordora-text-secondary)">
          Chargement des abonnements...
        </Text>
      </Flex>
    );
  }
  
  // Afficher un message d'erreur si nécessaire
  if (error) {
    return (
      <Alert 
        variation="error" 
        heading="Erreur" 
        marginBottom="1rem"
        isDismissible={true}
      >
        {error}
      </Alert>
    );
  }
  
  // Afficher un message si aucun abonnement
  if (!following || following.length === 0) {
    return (
      <View padding="2rem" textAlign="center">
        <Text color="var(--chordora-text-secondary)">
          Aucun abonnement pour le moment
        </Text>
      </View>
    );
  }
  
  return (
    <View>
      {following.map((user, index) => (
        <React.Fragment key={user.userId}>
          <UserItem 
            user={{...user, isFollowing: true}} // Par défaut, on suit toujours les gens dans cette liste
            onFollowToggle={handleFollowToggle}
          />
          {index < following.length - 1 && (
            <Divider 
              orientation="horizontal" 
              style={{ 
                backgroundColor: 'var(--chordora-divider)',
                opacity: 0.3,
                margin: '0 0.5rem'
              }} 
            />
          )}
        </React.Fragment>
      ))}
    </View>
  );
};

export default FollowingList;