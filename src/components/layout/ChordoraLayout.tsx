import React, { useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  View, 
  Flex, 
  Text, 
  Button, 
  Image,
  useAuthenticator
} from '@aws-amplify/ui-react';
import { 
  FaHome, 
  FaSearch, 
  FaMusic, 
  FaUser, 
  FaHeart,
  FaSignOutAlt,
  FaSignInAlt,
  FaCog
} from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';

interface ChordoraLayoutProps {
  children: React.ReactNode;
}

/**
 * Layout principal de l'application avec menu latéral et zones de contenu
 */
const ChordoraLayout: React.FC<ChordoraLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const { signOut } = useAuthenticator(context => [context.signOut]);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  // Déterminer si le menu est actif
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  // Navigation vers un chemin
  const navigateTo = useCallback((path: string) => {
    navigate(path);
    setShowMobileMenu(false);
  }, [navigate]);

  // Déconnexion
  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  // Toggle du menu mobile
  const toggleMobileMenu = () => {
    setShowMobileMenu(prev => !prev);
  };

  return (
    <Flex className="chordora-layout">
      {/* Menu latéral */}
      <View 
        className="sidebar"
        backgroundColor="#1e2024"
        color="white"
        width={{ base: showMobileMenu ? '100%' : '0', medium: '240px' }}
        height="100vh"
        position={{ base: 'fixed', medium: 'sticky' }}
        left="0"
        top="0"
        padding={{ base: showMobileMenu ? '1rem' : '0', medium: '1rem' }}
        style={{ 
          overflowY: 'auto',
          zIndex: 100,
          transition: 'width 0.3s ease, padding 0.3s ease',
          display: showMobileMenu ? 'block' : 'none',
          [window.matchMedia('(min-width: 768px)').matches ? 'display' : '']: 'block'
        }}
      >
        {/* Logo */}
        <Flex justifyContent="center" marginBottom="2rem">
          <Image
            src="/logo.svg"
            alt="Chordora Logo"
            height="60px"
            onClick={() => navigateTo('/')}
            style={{ cursor: 'pointer' }}
          />
        </Flex>

        {/* Menu principal */}
        <Flex direction="column" gap="0.5rem">
          <Text color="#87e54c" fontWeight="bold" marginBottom="0.5rem">MENU</Text>
          
          <Button
            onClick={() => navigateTo('/')}
            backgroundColor={isActive('/') ? 'rgba(135, 229, 76, 0.2)' : 'transparent'}
            color={isActive('/') ? '#87e54c' : 'white'}
            justifyContent="flex-start"
            fontWeight={isActive('/') ? 'bold' : 'normal'}
            style={{ borderRadius: '8px', padding: '0.75rem 1rem' }}
          >
            <FaHome style={{ marginRight: '12px' }} />
            Accueil
          </Button>
          
          <Button
            onClick={() => navigateTo('/users')}
            backgroundColor={isActive('/users') ? 'rgba(135, 229, 76, 0.2)' : 'transparent'}
            color={isActive('/users') ? '#87e54c' : 'white'}
            justifyContent="flex-start"
            fontWeight={isActive('/users') ? 'bold' : 'normal'}
            style={{ borderRadius: '8px', padding: '0.75rem 1rem' }}
          >
            <FaSearch style={{ marginRight: '12px' }} />
            Explorer
          </Button>
          
          {isAuthenticated && (
            <>
              <Text color="#87e54c" fontWeight="bold" marginTop="1.5rem" marginBottom="0.5rem">
                MON COMPTE
              </Text>
              
              <Button
                onClick={() => navigateTo('/profile')}
                backgroundColor={isActive('/profile') ? 'rgba(135, 229, 76, 0.2)' : 'transparent'}
                color={isActive('/profile') ? '#87e54c' : 'white'}
                justifyContent="flex-start"
                fontWeight={isActive('/profile') ? 'bold' : 'normal'}
                style={{ borderRadius: '8px', padding: '0.75rem 1rem' }}
              >
                <FaUser style={{ marginRight: '12px' }} />
                Mon Profil
              </Button>
              
              <Button
                onClick={() => navigateTo('/add-track')}
                backgroundColor={isActive('/add-track') ? 'rgba(135, 229, 76, 0.2)' : 'transparent'}
                color={isActive('/add-track') ? '#87e54c' : 'white'}
                justifyContent="flex-start"
                fontWeight={isActive('/add-track') ? 'bold' : 'normal'}
                style={{ borderRadius: '8px', padding: '0.75rem 1rem' }}
              >
                <FaMusic style={{ marginRight: '12px' }} />
                Ajouter une piste
              </Button>
              
              {/* Bouton pour les favoris */}
              <Button
                onClick={() => navigateTo('/favorites')}
                backgroundColor={isActive('/favorites') ? 'rgba(135, 229, 76, 0.2)' : 'transparent'}
                color={isActive('/favorites') ? '#87e54c' : 'white'}
                justifyContent="flex-start"
                fontWeight={isActive('/favorites') ? 'bold' : 'normal'}
                style={{ borderRadius: '8px', padding: '0.75rem 1rem' }}
              >
                <FaHeart style={{ marginRight: '12px' }} />
                Favoris
              </Button>
              
              <Button
                onClick={() => navigateTo('/account-settings')}
                backgroundColor={isActive('/account-settings') ? 'rgba(135, 229, 76, 0.2)' : 'transparent'}
                color={isActive('/account-settings') ? '#87e54c' : 'white'}
                justifyContent="flex-start"
                fontWeight={isActive('/account-settings') ? 'bold' : 'normal'}
                style={{ borderRadius: '8px', padding: '0.75rem 1rem' }}
              >
                <FaCog style={{ marginRight: '12px' }} />
                Paramètres du compte
              </Button>
              
              <Button
                onClick={handleLogout}
                backgroundColor="transparent"
                color="white"
                justifyContent="flex-start"
                style={{ 
                  borderRadius: '8px', 
                  padding: '0.75rem 1rem',
                  marginTop: 'auto',
                  marginBottom: '2rem'
                }}
              >
                <FaSignOutAlt style={{ marginRight: '12px' }} />
                Déconnexion
              </Button>
            </>
          )}
          
          {!isAuthenticated && (
            <Button
              onClick={() => navigateTo('/auth')}
              backgroundColor="#3e1dfc"
              color="white"
              style={{ 
                borderRadius: '8px', 
                padding: '0.75rem 1rem', 
                marginTop: '2rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <FaSignInAlt />
              Connexion / Inscription
            </Button>
          )}
        </Flex>
      </View>

      {/* Contenu principal */}
      <View
        backgroundColor="#1e2024"
        color="white"
        padding={{ base: '1rem', medium: '2rem' }}
        width="100%"
        style={{ minHeight: '100vh' }}
      >
        {/* Bouton de menu hamburger sur mobile */}
        <Button
          onClick={toggleMobileMenu}
          display={{ base: 'flex', medium: 'none' }}
          position="fixed"
          top="1rem"
          left="1rem"
          style={{ 
            backdropFilter: 'blur(5px)',
            backgroundColor: 'rgba(30, 32, 36, 0.8)',
            zIndex: 10
          }}
          size="small"
          variation="link"
        >
          {showMobileMenu ? '×' : '☰'}
        </Button>
        
        {/* Contenu de la page */}
        <View paddingTop={{ base: '3rem', medium: '0' }}>
          {children}
        </View>
      </View>
    </Flex>
  );
};

export default ChordoraLayout;