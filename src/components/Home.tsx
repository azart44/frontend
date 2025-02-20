import React from 'react';
import { useAuthenticator, Button, Heading, Flex } from '@aws-amplify/ui-react';
import { Link } from 'react-router-dom';

const Home: React.FC = () => {
  const { user, signOut } = useAuthenticator((context) => [context.user, context.signOut]);

  return (
    <Flex direction="column" alignItems="center" padding="2rem">
      <Heading level={1}>Welcome {user?.username}</Heading>
      <Flex direction="row" gap="1rem" marginTop="1rem">
        <Link to="/profile">
          <Button>Go to Profile</Button>
        </Link>
        <Button onClick={signOut}>Sign out</Button>
      </Flex>
    </Flex>
  );
};

export default Home;