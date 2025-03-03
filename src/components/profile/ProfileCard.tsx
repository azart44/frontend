import React, { useState } from 'react';
import { 
  Card, 
  Heading, 
  Text, 
  Badge, 
  Flex, 
  Image, 
  View
} from '@aws-amplify/ui-react';
import { UserProfile } from '../../types/ProfileTypes';

interface ProfileCardProps {
  profile: UserProfile;
  isPreview?: boolean;
  showExtendedInfo?: boolean;
}

/**
 * Composant pour afficher un profil utilisateur dans un format carte
 */
const ProfileCard: React.FC<ProfileCardProps> = ({ 
  profile, 
  isPreview = false,
  showExtendedInfo = true 
}) => {
  const [imageError, setImageError] = useState(false);
  
  // Générer l'URL de l'image de profil
  const profileImageSrc = imageError || !profile.profileImageUrl 
    ? '/default-profile.jpg' 
    : profile.profileImageUrl;
  
  const handleImageError = () => {
    setImageError(true);
  };
  
  // Déterminer la taille selon le mode d'affichage
  const imageSize = isPreview ? "80px" : "150px";
  
  return (
    <Card 
      variation="elevated"
      padding={isPreview ? "1rem" : "2rem"}
      style={isPreview ? { cursor: 'pointer' } : undefined}
    >
      <Flex direction="column" alignItems="center">
        {/* Image de profil */}
        <View position="relative" width={imageSize} height={imageSize}>
          <Image
            src={profileImageSrc}
            alt={`${profile.username || 'User'}'s profile`}
            width="100%"
            height="100%"
            style={{ 
              objectFit: 'cover', 
              borderRadius: '50%'
            }}
            onError={handleImageError}
          />
        </View>
        
        <Heading 
          level={isPreview ? 5 : 3} 
          marginTop="0.5rem"
        >
          {profile.username || 'Utilisateur'}
        </Heading>
        
        {!isPreview && profile.email && (
          <Text>{profile.email}</Text>
        )}
        
        <Flex marginTop="0.5rem" gap="0.5rem" wrap="wrap" justifyContent="center">
          {profile.userType && <Badge variation="info">{profile.userType}</Badge>}
          {profile.experienceLevel && <Badge variation="success">{profile.experienceLevel}</Badge>}
          {profile.location && (
            <Badge variation="warning">
              {profile.location}
            </Badge>
          )}
        </Flex>
        
        {/* Afficher plus d'informations si demandé */}
        {showExtendedInfo && !isPreview && (
          <>
            {profile.bio && (
              <Text marginTop="1rem" textAlign="center">
                {profile.bio}
              </Text>
            )}
            
            {profile.tags && profile.tags.length > 0 && (
              <Flex marginTop="1rem" gap="0.5rem" wrap="wrap" justifyContent="center">
                {profile.tags.map(tag => (
                  <Badge key={tag} variation="warning" size="small">
                    {tag}
                  </Badge>
                ))}
              </Flex>
            )}
          </>
        )}
      </Flex>
    </Card>
  );
};

export default React.memo(ProfileCard);