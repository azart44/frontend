import React, { useState } from 'react';
import { 
  Text, 
  Button,
  Flex,
  Image,
  Badge
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
  onFollowStateChange?: () => void;
}

/**
 * Modal pour afficher les followers et abonnements d'un utilisateur
 * Redesign avec un style cohérent et des animations fluides
 */
const FollowModal: React.FC<FollowModalProps> = ({
  userId,
  isOpen,
  onClose,
  initialTab = 'followers',
  username = 'Utilisateur',
  onFollowStateChange
}) => {
  const [activeTab, setActiveTab] = useState<'followers' | 'following'>(initialTab);
  
  // Gérer les changements d'état de suivi
  const handleFollowChange = () => {
    if (onFollowStateChange) {
      onFollowStateChange();
    }
  };
  
  return (
    <CustomModal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <Flex alignItems="center" gap="0.5rem">
          <Text>{activeTab === 'followers' ? `Abonnés de ${username}` : `Abonnements de ${username}`}</Text>
          <Badge variation="info" style={{ backgroundColor: 'var(--chordora-primary)', color: 'white' }}>
            {activeTab === 'followers' ? '3' : '3'}
          </Badge>
        </Flex>
      }
      width="550px"
    >
      <CustomModal.Body>
        {/* Tabs améliorés */}
        <Flex 
          marginBottom="1.5rem" 
          style={{ 
            borderBottom: '1px solid var(--chordora-divider)',
            position: 'sticky',
            top: 0,
            backgroundColor: 'var(--chordora-card-bg)',
            zIndex: 2
          }}
        >
          <TabButton 
            label="Abonnés" 
            isActive={activeTab === 'followers'} 
            onClick={() => setActiveTab('followers')}
          />
          <TabButton 
            label="Abonnements" 
            isActive={activeTab === 'following'} 
            onClick={() => setActiveTab('following')}
          />
        </Flex>
        
        {/* Contenu des tabs avec transition */}
        <div style={{ 
          opacity: 1,
          transition: 'opacity 0.2s ease',
        }}>
          {activeTab === 'followers' && userId && (
            <FollowersList 
              userId={userId} 
              title={`Abonnés de ${username}`}
              onFollowStateChange={handleFollowChange}
            />
          )}
          
          {activeTab === 'following' && userId && (
            <FollowingList 
              userId={userId} 
              title={`Abonnements de ${username}`}
              onFollowStateChange={handleFollowChange}
            />
          )}
        </div>
      </CustomModal.Body>
    </CustomModal>
  );
};

// Composant de bouton d'onglet personnalisé pour une meilleure consistance visuelle
const TabButton: React.FC<{ 
  label: string; 
  isActive: boolean; 
  onClick: () => void;
}> = ({ label, isActive, onClick }) => (
  <button
    onClick={onClick}
    style={{
      background: 'transparent',
      border: 'none',
      borderBottom: isActive ? '2px solid var(--chordora-primary)' : '2px solid transparent',
      padding: '0.75rem 1.5rem',
      cursor: 'pointer',
      color: isActive ? 'var(--chordora-primary)' : 'var(--chordora-text-secondary)',
      fontWeight: isActive ? 'bold' : 'normal',
      transition: 'all 0.2s ease',
      outline: 'none',
      position: 'relative'
    }}
  >
    {label}
  </button>
);

export default FollowModal;