import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, useAuthenticator, Image, Flex, View } from '@aws-amplify/ui-react';
import { useAuth } from '../contexts/AuthContext';
import logo from '../assets/images/logo.png';

const Header: React.FC = () => {
  const { signOut } = useAuthenticator((context) => [context.signOut]);
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  const handleAuthAction = () => {
    isAuthenticated ? signOut() : navigate('/auth');
  };

  return (
    <View as="header" padding="1rem">
      <Flex direction="row" justifyContent="space-between" alignItems="center">
        <Image
          src={logo}
          alt="Chardora Logo"
          objectFit="contain"
          maxHeight="50px"
          onClick={() => navigate('/')}
          style={{ cursor: 'pointer' }}
        />
        <Flex as="nav" alignItems="center">
          {!isLoading && (
            <>
              {isAuthenticated && (
                <Button variation="link" onClick={() => navigate('/profile')} marginRight="1rem">
                  Profile
                </Button>
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