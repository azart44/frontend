import React, { useState, useEffect } from 'react';
import { 
  View, 
  Heading, 
  Text, 
  Badge, 
  Flex, 
  Button, 
  Card,
  Image,
  Loader,
  SearchField
} from '@aws-amplify/ui-react';
import { useNavigate } from 'react-router-dom';
import api from '../../api';
import { UserProfile } from '../../types/ProfileTypes';

interface UserListProps {
  initialFilter?: string;
}

const UserList: React.FC<UserListProps> = ({ initialFilter = '' }) => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState(initialFilter);
  const [filterType, setFilterType] = useState<string>('all');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoading(true);
        const response = await api.get('/get-all-users');
        setUsers(response.data);
        setFilteredUsers(response.data);
      } catch (error) {
        console.error('Error fetching users:', error);
        setError('Failed to load users. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, []);

  useEffect(() => {
    // Apply filters when search term or filter type changes
    let results = [...users];
    
    // Filter by search term
    if (searchTerm) {
      results = results.filter(user => 
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.tags && user.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))) ||
        (user.musicGenres && user.musicGenres.some(genre => genre.toLowerCase().includes(searchTerm.toLowerCase())))
      );
    }
    
    // Filter by user type
    if (filterType !== 'all') {
      results = results.filter(user => user.userType === filterType);
    }
    
    setFilteredUsers(results);
  }, [searchTerm, filterType, users]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleFilterChange = (type: string) => {
    setFilterType(type);
  };

  const handleUserClick = (userId: string) => {
    navigate(`/profile/${userId}`);
  };

  if (isLoading) return <Loader />;
  
  if (error) {
    return (
      <View padding="2rem">
        <Heading level={1}>Explore Artists</Heading>
        <Text color="red">{error}</Text>
      </View>
    );
  }

  return (
    <View padding="2rem">
      <Heading level={1}>Explore Artists</Heading>
      
      {/* Search and filters */}
      <Flex 
        direction={{ base: 'column', medium: 'row' }}
        alignItems={{ base: 'stretch', medium: 'center' }}
        gap="1rem"
        style={{ marginTop: '2rem', marginBottom: '2rem' }}
      >
        <SearchField
          label="Search"
          labelHidden
          placeholder="Search by name, tag, or genre..."
          value={searchTerm}
          onChange={handleSearchChange}
          style={{ flex: 1 }}
        />
        
        <Flex gap="0.5rem">
          <Button 
            variation={filterType === 'all' ? 'primary' : 'link'}
            onClick={() => handleFilterChange('all')}
          >
            All
          </Button>
          <Button 
            variation={filterType === 'artist' ? 'primary' : 'link'}
            onClick={() => handleFilterChange('artist')}
          >
            Artists
          </Button>
          <Button 
            variation={filterType === 'producer' ? 'primary' : 'link'}
            onClick={() => handleFilterChange('producer')}
          >
            Producers
          </Button>
        </Flex>
      </Flex>
      
      {/* Results count */}
      <Text marginBottom="1rem">
        Found {filteredUsers.length} {filteredUsers.length === 1 ? 'user' : 'users'}
      </Text>
      
      {/* User grid */}
      <Flex
        wrap="wrap"
        gap="1rem"
        justifyContent="flex-start"
      >
        {filteredUsers.length > 0 ? filteredUsers.map(user => (
          <Card
            key={user.userId}
            padding="1rem"
            width={{ base: '100%', small: 'calc(50% - 0.5rem)', medium: 'calc(33.33% - 0.67rem)', large: 'calc(25% - 0.75rem)' }}
            onClick={() => handleUserClick(user.userId)}
            style={{ cursor: 'pointer' }}
          >
            <Flex direction="column" alignItems="center">
              <Image
                src={user.profileImageUrl || 'https://via.placeholder.com/100'}
                alt={`${user.username}'s profile`}
                width="100px"
                height="100px"
                style={{ objectFit: 'cover', borderRadius: '50%' }}
              />
              
              <Heading level={4} marginTop="0.5rem">{user.username}</Heading>
              
              <Flex gap="0.5rem" marginTop="0.5rem">
                <Badge variation="info">{user.userType}</Badge>
                <Badge variation="success">{user.experienceLevel}</Badge>
              </Flex>
              
              {user.musicGenres && user.musicGenres.length > 0 && (
                <Flex wrap="wrap" gap="0.25rem" marginTop="0.5rem" justifyContent="center">
                  {user.musicGenres.slice(0, 3).map(genre => (
                    <Badge key={genre} variation="info" size="small">{genre}</Badge>
                  ))}
                </Flex>
              )}
              
              {user.bio && (
                <Text
                  marginTop="0.5rem"
                  fontSize="small"
                  textAlign="center"
                  style={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                  }}
                >
                  {user.bio}
                </Text>
              )}
            </Flex>
          </Card>
        )) : (
          <Text>No users found matching your search criteria.</Text>
        )}
      </Flex>
    </View>
  );
};

export default UserList;