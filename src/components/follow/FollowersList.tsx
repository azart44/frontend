import React, { useState, useEffect } from 'react';
import { 
  View, 
  Flex, 
  Loader, 
  Text,
  Divider,
  Alert
} from '@aws-amplify/ui-react';
import { getFollowers } from '../../api/follow';
import UserItem from './UserItem';

interface FollowersListProps {
  userId: string;
  title?: string;
  onFollowStateChange?: () => void;
}

/**
 * Liste des abonnés améliorée avec un design cohérent et une meilleure UX
 */
const FollowersList: React.FC<FollowersListProps> = ({
  userId,
  title,
  onFollowStateChange
}) => {
  const [followers, setFollowers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Charger les abonnés au montage et quand userId change
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
        console.error('Erreur lors du chargement des abonnés:', error);
        setError('Impossible de charger les abonnés');
        setFollowers([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadFollowers();
  }, [userId]);
  
  // Gérer le toggle du bouton suivre/abonné
  const handleFollowToggle = (followerId: string, isFollowing: boolean) => {
    // Mettre à jour l'état "isFollowing" de l'utilisateur dans la liste
    // SANS le supprimer de la liste
    setFollowers(prevFollowers => 
      prevFollowers.map(user => 
        user.userId === followerId 
          ? { ...user, isFollowing: isFollowing } 
          : user
      )
    );
  };
  
  // Afficher un loader pendant le chargement
  if (isLoading) {
    return (
      <Flex direction="column" alignItems="center" padding="2rem">
        <Loader size="large" />
        <Text marginTop="1rem" color="var(--chordora-text-secondary)">
          Chargement des abonnés...
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
  
  // Afficher un message si aucun abonné
  if (!followers || followers.length === 0) {
    return (
      <View padding="2rem" textAlign="center">
        <Text color="var(--chordora-text-secondary)">
          Aucun abonné pour le moment
        </Text>
      </View>
    );
  }
  
  return (
    <View>
      {followers.map((user, index) => (
        <React.Fragment key={user.userId}>
          <UserItem 
            user={{...user, isFollowing: user.isFollowing || false}}
            onFollowToggle={handleFollowToggle}
            onFollowStateChange={onFollowStateChange}
          />
          {index < followers.length - 1 && (
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

export default FollowersList;