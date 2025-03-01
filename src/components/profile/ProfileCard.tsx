import React, { useState, useMemo } from 'react';
import { 
  Card, 
  Heading, 
  Text, 
  Badge, 
  Flex, 
  Image, 
} from '@aws-amplify/ui-react';
import { useNavigate } from 'react-router-dom';
import { UserProfile } from '../../types/ProfileTypes';
import { FaInstagram, FaSoundcloud } from 'react-icons/fa';

interface ProfileCardProps {
  profile: UserProfile;
  isPreview?: boolean;
}

const ProfileCard: React.FC<ProfileCardProps> = React.memo(({ profile, isPreview = false }) => {
  const navigate = useNavigate();
  const [imageError, setImageError] = useState(false);
  
  // Memoize the profile image source
  const profileImageSrc = useMemo(() => {
    if (imageError || !profile.profileImageBase64) {
      return '/path/to/default/image.jpg'; // Image par défaut
    }
    
    return profile.profileImageBase64.startsWith('data:') 
      ? profile.profileImageBase64 
      : `data:image/jpeg;base64,${profile.profileImageBase64}`;
  }, [profile.profileImageBase64, imageError]);
  
  // Optimiser le rendu conditionnel
  const renderSocialIcons = useMemo(() => {
    if (!profile.socialLinks) return null;
    
    return (
      <Flex marginTop="0.5rem" gap="0.5rem">
        {profile.socialLinks.instagram && (
          <FaInstagram 
            size={24} 
            onClick={() => window.open(profile.socialLinks?.instagram, '_blank')} 
            style={{ cursor: 'pointer' }} 
            aria-label="Instagram"
          />
        )}
        {profile.socialLinks.soundcloud && (
          <FaSoundcloud 
            size={24} 
            onClick={() => window.open(profile.socialLinks?.soundcloud, '_blank')} 
            style={{ cursor: 'pointer' }} 
            aria-label="SoundCloud"
          />
        )}
      </Flex>
    );
  }, [profile.socialLinks]);
  
  // Naviguer vers le profil complet si en mode prévisualisation
  const handleCardClick = () => {
    if (isPreview) {
      navigate(`/profile/${profile.userId}`);
    }
  };
  
  return (
    <Card 
      variation="elevated"
      padding={isPreview ? "1rem" : "2rem"}
      onClick={isPreview ? handleCardClick : undefined}
      style={isPreview ? { cursor: 'pointer' } : undefined}
    >
      <Flex direction="column" alignItems="center">
        <Image
          src={profileImageSrc}
          alt={`${profile.username}`}
          width={isPreview ? "80px" : "150px"}
          height={isPreview ? "80px" : "150px"}
          style={{ 
            objectFit: 'cover', 
            borderRadius: '50%',
          }}
          onError={() => setImageError(true)}
          loading="lazy"
        />
        
        <Heading 
          level={isPreview ? 5 : 3} 
          marginTop="0.5rem"
        >
          {profile.username}
        </Heading>
        
        {!isPreview && <Text>{profile.email}</Text>}
        
        <Flex marginTop="0.5rem" gap="0.5rem">
          <Badge variation="info">{profile.userType}</Badge>
          <Badge variation="success">{profile.experienceLevel}</Badge>
        </Flex>
        
        {renderSocialIcons}
        
        {!isPreview && profile.bio && (
          <Text marginTop="1rem">{profile.bio}</Text>
        )}
      </Flex>
    </Card>
  );
});

ProfileCard.displayName = 'ProfileCard';
export default ProfileCard;