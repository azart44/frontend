import React from 'react';
import { Flex, Text, Image, Card, Badge, View, Button } from '@aws-amplify/ui-react';
import { FaPlay, FaHeart, FaDownload } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';

const FeaturedSample: React.FC = React.memo(() => {
  const { isAuthenticated } = useAuth();

  return (
    <Card padding="1rem" marginBottom="2rem">
      <Flex alignItems="center" marginBottom="1rem">
        <Image src="https://via.placeholder.com/40" alt="User" borderRadius="50%" marginRight="0.5rem" />
        <Text>trustmelucien uploaded a sample pack · 19h ago</Text>
      </Flex>
      <Flex alignItems="center" marginBottom="1rem">
        <Button><FaPlay /></Button>
        <View flex={1} height="40px" backgroundColor="#f0f0f0" marginLeft="1rem"></View>
      </Flex>
      {[1, 2, 3, 4, 5].map((num) => (
        <Flex key={num} justifyContent="space-between" alignItems="center" marginBottom="0.5rem">
          <Text>{num}. Sample {num}.wav</Text>
          <Flex alignItems="center">
            <Badge>TRAP</Badge>
            <Badge variation="warning" marginLeft="0.5rem">NEW</Badge>
            <Text marginLeft="0.5rem">1:23</Text>
            {isAuthenticated ? (
              <>
                <Button padding="0" backgroundColor="transparent"><FaHeart /></Button>
                <Button padding="0" backgroundColor="transparent"><FaDownload /></Button>
              </>
            ) : (
              <Link to="/auth">
                <Button size="small">Sign in to interact</Button>
              </Link>
            )}
          </Flex>
        </Flex>
      ))}
      <Button variation="link">View 5 more</Button>
    </Card>
  );
});

const TopCreator: React.FC<{ name: string }> = React.memo(({ name }) => {
  const { isAuthenticated } = useAuth();

  return (
    <Flex justifyContent="space-between" alignItems="center" marginBottom="0.5rem">
      <Flex alignItems="center">
        <Image src={`https://via.placeholder.com/30`} alt={name} borderRadius="50%" marginRight="0.5rem" />
        <Text>{name}</Text>
      </Flex>
      {isAuthenticated ? (
        <Button size="small">Follow</Button>
      ) : (
        <Link to="/auth">
          <Button size="small">Sign in to follow</Button>
        </Link>
      )}
    </Flex>
  );
});

const Home: React.FC = () => {
  const { isAuthenticated } = useAuth();

  const handleRefresh = () => {
    // Implement refresh logic here
    console.log('Refreshing top creators...');
  };

  return (
    <Flex direction="column" minHeight="100vh">
      <Flex padding="2rem">
        {/* Feed */}
        <Flex direction="column" flex={3} marginRight="2rem">
          <Text fontSize="2xl" fontWeight="bold" marginBottom="1rem">Featured Samples</Text>
          <FeaturedSample />
        </Flex>

        {/* Sidebar */}
        <Flex direction="column" flex={1}>
          <Card padding="1rem" marginBottom="1rem">
            <Flex justifyContent="space-between" alignItems="center" marginBottom="1rem">
              <Text fontWeight="bold">Top Creators</Text>
              <Button variation="link" onClick={handleRefresh}>Refresh</Button>
            </Flex>
            {['Keiji', 'Project Blvck', 'SeaSky', 'B', 'D. Sharp'].map((name) => (
              <TopCreator key={name} name={name} />
            ))}
          </Card>
          {isAuthenticated && (
            <Card padding="1rem">
              <Flex justifyContent="space-between" alignItems="center">
                <Text fontWeight="bold">Recent likes</Text>
                <Button variation="link">View all</Button>
              </Flex>
            </Card>
          )}
        </Flex>
      </Flex>
    </Flex>
  );
};

export default Home;