import React from 'react';
import { Button } from '@aws-amplify/ui-react';
import { Link } from 'react-router-dom';

interface ProfileProps {
  user: any;
}

function Profile({ user }: ProfileProps) {
  return (
    <div>
      <h1>Profile Page</h1>
      <p>Username: {user.username}</p>
      <p>Email: {user.attributes?.email || 'N/A'}</p>
      <Link to="/">
        <Button>Back to Home</Button>
      </Link>
    </div>
  );
}

export default Profile;