import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { View, Heading, Text, Flex, Card, Image, Loader } from '@aws-amplify/ui-react';
import api from '../utils/api';
import { UserProfile } from '../types/ProfileTypes';
import { fetchProfileImage } from '../utils/ProfileUtils';

interface UserWithImage extends UserProfile {
  imageUrl: string | null;
}

const UserList: React.FC = () => {
  const [users, setUsers] = useState<UserWithImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoading(true);
        const response = await api.get<UserProfile[]>('/get-all-users');
        const usersWithImages = await Promise.all(
          response.data.map(async (user) => ({
            ...user,
            imageUrl: await fetchProfileImage(user.userId)
          }))
        );
        setUsers(usersWithImages);
      } catch (error) {
        console.error('Error fetching users:', error);
        setError('Error fetching users. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, []);

  if (isLoading) {
    return <Loader />;
  }

  if (error) {
    return <Text>{error}</Text>;
  }

  return (
    <View padding="2rem">
      <Heading level={1}>User Profiles</Heading>
      <Flex direction="row" wrap="wrap" gap="1rem">
        {users.map((user) => (
          <Card key={user.userId} padding="1rem" width="200px">
            <Link to={`/profile/${user.userId}`} style={{ textDecoration: 'none', color: 'inherit' }}>
              <Flex direction="column" alignItems="center">
                <Image
                  src={user.imageUrl || undefined}
                  alt={`${user.userId}'s profile`}
                  width="100px"
                  height="100px"
                  objectFit="cover"
                  borderRadius="50%"
                />
                <Heading level={3}>{user.userId}</Heading>
                <Text>{user.userType}</Text>
              </Flex>
            </Link>
          </Card>
        ))}
      </Flex>
    </View>
  );
};

export default UserList;