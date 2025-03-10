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
  useTheme
} from '@aws-amplify/ui-react';
import { useNavigate } from 'react-router-dom';
import { fetchUserAttributes } from 'aws-amplify/auth';
import '../../ChordoraTheme.css';

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
  const { tokens } = useTheme();
  
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
        components={{
          SignUp: {
            FormFields() {
              const { validationErrors } = useAuthenticator();
              
              return (
                <>
                  <TextField
                    label="Nom d'utilisateur"
                    name="username"
                    placeholder="Entrez votre nom d'utilisateur"
                    required
                    hasError={!!validationErrors.username}
                    errorMessage={validationErrors.username}
                  />
                  <TextField
                    label="Email"
                    name="email"
                    placeholder="Entrez votre email"
                    type="email"
                    required
                    hasError={!!validationErrors.email}
                    errorMessage={validationErrors.email}
                  />
                  <Authenticator.SignUp.Password />
                  <Authenticator.SignUp.ConfirmPassword />
                </>, 
              );
            },
          },
          SignIn: {
            FormFields() {
              const { validationErrors } = useAuthenticator();
              
              return (
                <>
                  <TextField
                    label="Nom d'utilisateur"
                    name="username"
                    placeholder="Entrez votre nom d'utilisateur"
                    required
                    hasError={!!validationErrors.username}
                    errorMessage={validationErrors.username}
                  />
                  <Authenticator.SignIn.Password />
                </>
              );
            },
          },
          Footer() {
            return (
              <View textAlign="center" padding="1rem 0">
                <Text color="#a0a0a0" fontSize="0.8rem">
                  En vous inscrivant, vous acceptez nos conditions d'utilisation et notre politique de confidentialité.
                </Text>
              </View>
            )
          }
        }}
      />
    </View>
  );
});

export default AuthPage;
