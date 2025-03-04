import React, { useState } from 'react';
import { 
  View, 
  Heading, 
  Button,
  Tabs,
  Flex
} from '@aws-amplify/ui-react';
import FollowersList from './FollowersList';
import FollowingList from './FollowingList';
import CustomModal from '../common/CustomModal';

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
    <CustomModal
      isOpen={isOpen}
      onClose={onClose}
      title={activeTab === 'followers' ? `Abonnés de ${username}` : `Abonnements de ${username}`}
      footer={
        <Button onClick={onClose} variation="primary">
          Fermer
        </Button>
      }
    >
      <CustomModal.Body>
        <Flex marginBottom="1rem">
          <Button 
            onClick={() => setActiveTab('followers')}
            variation={activeTab === 'followers' ? 'primary' : 'link'}
            flex={1}
          >
            Abonnés
          </Button>
          <Button 
            onClick={() => setActiveTab('following')}
            variation={activeTab === 'following' ? 'primary' : 'link'}
            flex={1}
          >
            Abonnements
          </Button>
        </Flex>
        
        {activeTab === 'followers' && userId && (
          <FollowersList 
            userId={userId} 
            title={`Abonnés de ${username}`} 
          />
        )}
        
        {activeTab === 'following' && userId && (
          <FollowingList 
            userId={userId} 
            title={`Abonnements de ${username}`} 
          />
        )}
      </CustomModal.Body>
    </CustomModal>
  );
};

export default FollowModal;