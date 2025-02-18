import React from 'react';
import { useAuthenticator, Button } from '@aws-amplify/ui-react';
import { Link } from 'react-router-dom';

interface HomeProps {
  signOut?: () => void;
}

function Home({ signOut }: HomeProps) {
  const { user } = useAuthenticator((context) => [context.user]);

  return (
    <div>
      <h1>Welcome {user?.username}</h1>
      <Link to="/profile">
        <Button>Go to Profile</Button>
      </Link>
      <Button onClick={signOut}>Sign out</Button>
    </div>
  );
}

export default Home;