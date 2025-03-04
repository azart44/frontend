import React, { useState } from 'react';
import { 
  View, 
  Heading, 
  Dialog, 
  Button, 
  Tabs, 
  TabItem 
} from '@aws-amplify/ui-react';
import FollowersList from './FollowersList';
import FollowingList from './FollowingList';

interface FollowModalProps {
  userId: string;
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'followers' | 'following';
  username?: string;
}

/**
 * Modal pour afficher les followers et abonnements d'un utilisateur
 */
const FollowModal: React.FC<FollowModalProps> = ({
  userId,
  isOpen,
  onClose,
  initialTab = 'followers',
  username = 'Utilisateur'
}) => {
  const [activeTab, setActiveTab] = useState<'followers' | 'following'>(initialTab);
  
  if (!isOpen) return null;
  
  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      aria-labelledby="follow-modal-title"
    >
      <View padding="0">
        <Tabs
          currentIndex={activeTab === 'followers' ? 0 : 1}
          onChange={(i) => setActiveTab(i === 0 ? 'followers' : 'following')}
          justifyContent="center"
        >
          <TabItem title="Abonnés">
            <FollowersList 
              userId={userId} 
              title={`Abonnés de ${username}`} 
            />
          </TabItem>
          
          <TabItem title="Abonnements">
            <FollowingList 
              userId={userId} 
              title={`Abonnements de ${username}`} 
            />
          </TabItem>
        </Tabs>
        
        <View padding="1rem" textAlign="center">
          <Button onClick={onClose} variation="primary">
            Fermer
          </Button>
        </View>
      </View>
    </Dialog>
  );
};

export default FollowModal;