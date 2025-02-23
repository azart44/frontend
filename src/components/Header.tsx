import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Button, 
  useAuthenticator, 
  Image, 
  Flex, 
  View
} from '@aws-amplify/ui-react';
import { useAuth } from '../contexts/AuthContext';
import logo from '../assets/images/logo.png';
import SearchWithSuggestions from './SearchWithSuggestions';

const Header: React.FC = () => {
  const { signOut } = useAuthenticator((context) => [context.signOut]);
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  const handleAuthAction = async () => {
    if (isAuthenticated) {
      try {
        await signOut();
        navigate('/');  // Redirection vers la page d'accueil après la déconnexion
      } catch (error) {
        console.error('Error during sign out:', error);
      }
    } else {
      navigate('/auth');
    }
  };

  return (
    <View as="header" padding="1rem" style={{ borderBottom: "1px solid #e0e0e0" }}>
      <Flex direction="row" justifyContent="space-between" alignItems="center">
        <Image
          src={logo}
          alt="Chordora Logo"
          objectFit="contain"
          maxHeight="50px"
          onClick={() => navigate('/')}
          style={{ cursor: 'pointer' }}
        />
        <Flex as="nav" alignItems="center">
          <Button variation="link" marginRight="1rem" onClick={() => navigate('/discover')}>Discover</Button>
          <Button variation="link" marginRight="1rem" onClick={() => navigate('/feed')}>Feed</Button>
          <Button variation="link" marginRight="1rem" onClick={() => navigate('/sounds')}>Sounds</Button>
          <Button variation="link" marginRight="1rem" onClick={() => navigate('/pricing')}>Pricing</Button>
          <SearchWithSuggestions />
          {!isLoading && (
            <>
              {isAuthenticated && (
                <>
                  <Button variation="link" onClick={() => navigate('/')} marginRight="1rem">
                    Home
                  </Button>
                  <Button variation="link" onClick={() => navigate('/profile')} marginRight="1rem">
                    Profile
                  </Button>
                </>
              )}
              <Button variation="primary" onClick={handleAuthAction}>
                {isAuthenticated ? 'Logout' : 'Login / Register'}
              </Button>
            </>
          )}
        </Flex>
      </Flex>
    </View>
  );
};

export default Header;