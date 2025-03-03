import React, { useState, useEffect, useMemo } from 'react';
import { 
  Card, 
  Heading, 
  Text, 
  Badge, 
  Flex, 
  Image, 
  Loader,
  View
} from '@aws-amplify/ui-react';
import { UserProfile } from '../../types/ProfileTypes';

interface ProfileCardProps {
  profile: UserProfile;
  isPreview?: boolean;
  showExtendedInfo?: boolean;
}

const ProfileCard: React.FC<ProfileCardProps> = ({ 
  profile, 
  isPreview = false,
  showExtendedInfo = true 
}) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  
  const profileImageSrc = useMemo(() => {
    if (profile.profileImageUrl) {
      console.log('Using profile image URL:', profile.profileImageUrl);
      return profile.profileImageUrl;
    }
    return null;
  }, [profile.profileImageUrl]);
  
  useEffect(() => {
    console.log('ProfileCard mounted/updated:', {
      username: profile.username,
      hasProfileImageUrl: !!profile.profileImageUrl
    });

    // Reset image state when profile changes
    setImageError(false);
    setImageLoading(true);
  }, [profile]);

  const handleImageError = () => {
    console.error('Image load error:', {
      profileImageUrl: profile.profileImageUrl,
      currentSrc: profileImageSrc,
      imageError,
      imageLoading
    });
    setImageError(true);
    setImageLoading(false);
  };
  
  const handleImageLoad = () => {
    console.log('Image loaded successfully:', {
      profileImageUrl: profile.profileImageUrl,
      currentSrc: profileImageSrc
    });
    setImageLoading(false);
  };

  const imageSize = isPreview ? "80px" : "150px";
  
  const renderProfileImage = () => {
    if (!profileImageSrc || imageError) {
      return (
        <View 
          width="100%" 
          height="100%" 
          backgroundColor="lightgray"
          borderRadius="50%"
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}
        >
          <Text>{profile.username ? profile.username[0].toUpperCase() : 'U'}</Text>
        </View>
      );
    }

    return (
      <>
        {imageLoading && (
          <View 
            position="absolute" 
            top="0" 
            left="0" 
            right="0" 
            bottom="0" 
            backgroundColor="rgba(0,0,0,0.05)"
            borderRadius="50%"
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center'
            }}
          >
            <Loader size="small" />
          </View>
        )}
        <Image
          src={profileImageSrc}
          alt={`\${profile.username || 'User'}'s profile`}
          width="100%"
          height="100%"
          style={{ 
            objectFit: 'cover', 
            borderRadius: '50%'
          }}
          onError={handleImageError}
          onLoad={handleImageLoad}
        />
      </>
    );
  };

  return (
    <Card 
      variation="elevated"
      padding={isPreview ? "1rem" : "2rem"}
      onClick={isPreview ? () => {} : undefined}
      style={isPreview ? { cursor: 'pointer' } : undefined}
    >
      <Flex direction="column" alignItems="center">
        <View position="relative" width={imageSize} height={imageSize}>
          {renderProfileImage()}
        </View>
        
        <Heading 
          level={isPreview ? 5 : 3} 
          marginTop="0.5rem"
        >
          {profile.username || 'Utilisateur'}
        </Heading>
        
        {!isPreview && <Text>{profile.email}</Text>}
        
        <Flex marginTop="0.5rem" gap="0.5rem" wrap="wrap" justifyContent="center">
          {profile.userType && <Badge variation="info">{profile.userType}</Badge>}
          {profile.experienceLevel && <Badge variation="success">{profile.experienceLevel}</Badge>}
          {profile.location && (
            <Badge variation="warning">
              {profile.location}
            </Badge>
          )}
        </Flex>
        
        {showExtendedInfo && (
          <Flex direction="column" marginTop="1rem">
            {profile.bio && <Text>{profile.bio}</Text>}
            {profile.musicGenres && profile.musicGenres.length > 0 && (
              <Text>Genres: {profile.musicGenres.join(', ')}</Text>
            )}
            {profile.equipment && profile.equipment.length > 0 && (
              <Text>Équipement: {profile.equipment.join(', ')}</Text>
            )}
            {profile.favoriteArtists && profile.favoriteArtists.length > 0 && (
              <Text>Artistes favoris: {profile.favoriteArtists.join(', ')}</Text>
            )}
            {profile.software && (
              <Text>Logiciels: {profile.software}</Text>
            )}
            {profile.musicalMood && (
              <Text>Ambiance musicale: {profile.musicalMood}</Text>
            )}
          </Flex>
        )}
        
        {showExtendedInfo && profile.socialLinks && Object.keys(profile.socialLinks).length > 0 && (
          <Flex direction="column" marginTop="1rem">
            <Text fontWeight="bold">Liens sociaux:</Text>
            {Object.entries(profile.socialLinks).map(([platform, url]) => (
              <Text key={platform}>
                {platform}: <a href={url} target="_blank" rel="noopener noreferrer">{url}</a>
              </Text>
            ))}
          </Flex>
        )}
      </Flex>
    </Card>
  );
};

export default React.memo(ProfileCard);