import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Button, 
  useAuthenticator, 
  Image, 
  Flex, 
  View,
  Menu,
  MenuItem,
  Divider
} from '@aws-amplify/ui-react';
import { FaUser, FaMusic, FaSignOutAlt, FaSignInAlt, FaSearch, FaHome } from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';
import SearchWithSuggestions from '../common/SearchWithSuggestions';
import logo from '../../assets/images/logo.png';

const Header: React.FC = () => {
  const { signOut } = useAuthenticator((context) => [context.signOut]);
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  
  const handleAuthAction = useCallback(async () => {
    if (isAuthenticated) {
      try {
        await signOut();
        navigate('/');
      } catch (error) {
        console.error('Erreur lors de la déconnexion:', error);
      }
    } else {
      navigate('/auth');
    }
  }, [isAuthenticated, signOut, navigate]);
  
  const toggleMobileMenu = useCallback(() => {
    setShowMobileMenu(prev => !prev);
  }, []);
  
  const navigateTo = useCallback((path: string) => {
    navigate(path);
    setShowMobileMenu(false);
  }, [navigate]);
  
  return (
    <View as="header" padding="1rem" backgroundColor="white" style={{ boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}>
      <Flex 
        direction={{ base: 'column', medium: 'row' }} 
        justifyContent="space-between" 
        alignItems="center"
      >
        {/* Logo */}
        <Flex alignItems="center">
          <Image
            src={logo}
            alt="Chordora Logo"
            objectFit="contain"
            maxHeight="50px"
            onClick={() => navigateTo('/')}
            style={{ cursor: 'pointer' }}
          />
        </Flex>
        
        {/* Barre de recherche */}
        <Flex 
          display={{ base: 'none', medium: 'flex' }}
          flex={1}
          justifyContent="center"
          style={{ marginLeft: '2rem', marginRight: '2rem' }}
        >
          <SearchWithSuggestions />
        </Flex>
        
        {/* Mobile menu button */}
        <Button
          display={{ base: 'flex', medium: 'none' }}
          onClick={toggleMobileMenu}
          variation="menu"
        >
          {showMobileMenu ? 'Fermer' : 'Menu'}
        </Button>
        
        {/* Navigation - Desktop */}
        <Flex 
          display={{ base: 'none', medium: 'flex' }} 
          alignItems="center"
          gap="1rem"
        >
          <Button variation="link" onClick={() => navigateTo('/')}>
            <FaHome /> Accueil
          </Button>
          
          <Button variation="link" onClick={() => navigateTo('/users')}>
            <FaSearch /> Explorer
          </Button>
          
          {!isLoading && (
            <>
              {isAuthenticated ? (
                <Menu>
                  <Button variation="primary">
                    <FaUser /> Mon compte
                  </Button>
                  <MenuItem onClick={() => navigateTo('/profile')}>
                    Mon profil
                  </MenuItem>
                  <MenuItem onClick={() => navigateTo('/add-track')}>
                    Ajouter une piste
                  </MenuItem>
                  <Divider />
                  <MenuItem onClick={handleAuthAction}>
                    <FaSignOutAlt /> Déconnexion
                  </MenuItem>
                </Menu>
              ) : (
                <Button variation="primary" onClick={handleAuthAction}>
                  <FaSignInAlt /> Connexion
                </Button>
              )}
            </>
          )}
        </Flex>
      </Flex>
      
      {/* Mobile menu */}
      {showMobileMenu && (
        <Flex
          direction="column"
          gap="0.5rem"
          marginTop="1rem"
          display={{ base: 'flex', medium: 'none' }}
        >
          <SearchWithSuggestions />
          
          <Button variation="link" onClick={() => navigateTo('/')}>
            <FaHome /> Accueil
          </Button>
          
          <Button variation="link" onClick={() => navigateTo('/users')}>
            <FaSearch /> Explorer
          </Button>
          
          {isAuthenticated ? (
            <>
              <Button variation="link" onClick={() => navigateTo('/profile')}>
                <FaUser /> Mon profil
              </Button>
              <Button variation="link" onClick={() => navigateTo('/add-track')}>
                <FaMusic /> Ajouter une piste
              </Button>
              <Button variation="link" onClick={handleAuthAction}>
                <FaSignOutAlt /> Déconnexion
              </Button>
            </>
          ) : (
            <Button variation="primary" onClick={handleAuthAction}>
              <FaSignInAlt /> Connexion / Inscription
            </Button>
          )}
        </Flex>
      )}
    </View>
  );
};

export default React.memo(Header);