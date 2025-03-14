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
  Button,
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

// Composants de formulaire personnalisés
const formFields = {
  signUp: {
    email: {
      label: 'Email',
      placeholder: 'Entrez votre adresse e-mail',
      isRequired: true,
      order: 1
    },
    password: {
      label: 'Mot de passe',
      placeholder: 'Créez un mot de passe sécurisé',
      isRequired: true,
      order: 2
    },
    confirm_password: {
      label: 'Confirmer le mot de passe',
      placeholder: 'Confirmez votre mot de passe',
      isRequired: true,
      order: 3
    },
    username: {
      label: 'Nom d\'utilisateur',
      placeholder: 'Choisissez un nom d\'utilisateur unique',
      isRequired: true,
      order: 4
    }
  },
  signIn: {
    username: {
      label: 'Email ou nom d\'utilisateur',
      placeholder: 'Entrez votre email ou nom d\'utilisateur',
      isRequired: true
    },
    password: {
      label: 'Mot de passe',
      placeholder: 'Entrez votre mot de passe',
      isRequired: true
    },
  }
};

// Composant de thème personnalisé
const components = {
  Header() {
    return (
      <Flex justifyContent="center" marginBottom="1rem">
        <Image
          src="/logo.svg"
          alt="Chordora Logo"
          height="60px"
        />
      </Flex>
    );
  },
  Footer() {
    return (
      <Flex justifyContent="center" marginTop="1.5rem">
        <Text fontSize="0.8rem" color="gray.400">
          © {new Date().getFullYear()} Chordora - Tous droits réservés
        </Text>
      </Flex>
    );
  }
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
        formFields={formFields}
        components={components}
        signUpAttributes={[
          'email',
          'name'
        ]}
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