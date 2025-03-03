import React, { useState } from 'react';
import { 
  Menu, 
  MenuItem, 
  MenuButton, 
  Divider,
  Button
} from '@aws-amplify/ui-react';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaCog, FaSignOutAlt, FaMusic, FaLock } from 'react-icons/fa';
import { useAuthenticator } from '@aws-amplify/ui-react';

/**
 * Menu déroulant pour les actions liées au profil
 */
const ProfileMenu: React.FC = () => {
  const { signOut } = useAuthenticator(context => [context.signOut]);
  const navigate = useNavigate();
  
  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };
  
  return (
    <Menu 
      trigger={
        <MenuButton variation="primary">
          <FaUser style={{ marginRight: '0.5rem' }} />
          Mon compte
        </MenuButton>
      }
    >
      <MenuItem onClick={() => navigate('/profile')}>
        <FaUser style={{ marginRight: '0.5rem' }} />
        Mon profil
      </MenuItem>
      
      <MenuItem onClick={() => navigate('/add-track')}>
        <FaMusic style={{ marginRight: '0.5rem' }} />
        Ajouter une piste
      </MenuItem>
      
      <MenuItem onClick={() => navigate('/account-settings')}>
        <FaCog style={{ marginRight: '0.5rem' }} />
        Paramètres du compte
      </MenuItem>
      
      <Divider />
      
      <MenuItem onClick={handleSignOut}>
        <FaSignOutAlt style={{ marginRight: '0.5rem' }} />
        Déconnexion
      </MenuItem>
    </Menu>
  );
};

export default ProfileMenu;