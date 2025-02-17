import React from 'react';
import { Button } from '@aws-amplify/ui-react';
import { Link } from 'react-router-dom';

interface HomeProps {
  signOut?: () => void;
  user?: any;
}

function Home({ signOut, user }: HomeProps) {
  return (
    <div>
      {user ? (
        <>
          <h1>Welcome {user.username}</h1>
          <Button onClick={signOut}>Sign out</Button>
          <Link to="/profile">
            <Button>Go to Profile</Button>
          </Link>
        </>
      ) : (
        <h1>Please sign in</h1>
      )}
    </div>
  );
}

export default Home;