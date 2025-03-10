import React, { useEffect } from 'react';
import { 
  Authenticator, 
  useAuthenticator, 
  TextField, 
  View, 
  Heading, 
  Text,
  Image,
  Flex,
  PasswordField,
  Button, // Add this import
  useTheme
} from '@aws-amplify/ui-react';
import { useNavigate } from 'react-router-dom';
import { fetchUserAttributes } from 'aws-amplify/auth';
import '../../ChordoraTheme.css';

// Hook personnalisé pour vérifier si le profil est complété
const useProfileCompletion = (authStatus: string, navigate: (path: string) => void) => {
  useEffect(() => {
    const checkProfileCompletion = async () => {
      if (authStatus === 'authenticated') {
        try {
          const attributes = await fetchUserAttributes();
          if (attributes['custom:profileCompleted'] === 'true') {
            navigate('/');
          } else {
            navigate('/complete-profile');
          }
        } catch (error) {
          console.error('Error fetching user attributes:', error);
          navigate('/complete-profile');
        }
      }
    };
    checkProfileCompletion();
  }, [authStatus, navigate]);
};

const AuthPage: React.FC = React.memo(() => {
  const navigate = useNavigate();
  const { authStatus } = useAuthenticator((context) => [context.authStatus]);
  
  useProfileCompletion(authStatus, navigate);

  return (
    <View className="auth-container">
      <Flex justifyContent="center" marginBottom="2rem">
        <Image
          src="/logo.svg"
          alt="Chordora Logo"
          height="80px"
          onClick={() => navigate('/')}
          style={{ cursor: 'pointer' }}
        />
      </Flex>
      
      <Heading level={3} textAlign="center" color="#87e54c" marginBottom="1rem">
        Bienvenue sur Chordora
      </Heading>
      
      <Text textAlign="center" color="#a0a0a0" marginBottom="2rem">
        Connectez-vous pour rejoindre la communauté musicale
      </Text>
      
      <Authenticator
        loginMechanisms={['username']}
        signUpAttributes={['email']}
      >
        {({ signOut, user }) => (
          <View>
            <Text>Vous êtes connecté!</Text>
            <Button onClick={signOut}>Déconnexion</Button>
          </View>
        )}
      </Authenticator>
    </View>
  );
});

export default AuthPage;
