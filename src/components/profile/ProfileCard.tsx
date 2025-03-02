import React, { useState, useMemo } from 'react';
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

// Chemin de l'image par défaut locale (dans le dossier public)
const DEFAULT_LOCAL_IMAGE = '/default-profile.jpg';

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
  
  // Memoize the profile image source
  const profileImageSrc = useMemo(() => {
    // Si erreur détectée, utiliser l'image par défaut locale
    if (imageError) {
      return DEFAULT_LOCAL_IMAGE;
    }
    
    // Premier choix: l'URL présignée du serveur
    if (profile.profileImageUrl) {
      return profile.profileImageUrl;
    }
    
    // Deuxième choix: si nous avons des données base64
    if (profile.profileImageBase64) {
      return profile.profileImageBase64.startsWith('data:') 
        ? profile.profileImageBase64 
        : `data:image/jpeg;base64,${profile.profileImageBase64}`;
    }
    
    // Fallback: image par défaut locale
    return DEFAULT_LOCAL_IMAGE;
  }, [profile.profileImageUrl, profile.profileImageBase64, imageError]);
  
  const handleImageError = () => {
    console.error('Erreur lors du chargement de l\'image de profil:', {
      profileImageUrl: profile.profileImageUrl,
      hasBase64: !!profile.profileImageBase64
    });
    setImageError(true);
    setImageLoading(false);
  };
  
  const handleImageLoad = () => {
    setImageLoading(false);
  };

  // Dimensions de l'image selon le mode
  const imageSize = isPreview ? "80px" : "150px";
  
  return (
    <Card 
      variation="elevated"
      padding={isPreview ? "1rem" : "2rem"}
      onClick={isPreview ? () => {} : undefined}
      style={isPreview ? { cursor: 'pointer' } : undefined}
    >
      <Flex direction="column" alignItems="center">
        {/* Conteneur d'image avec état de chargement */}
        <View position="relative" width={imageSize} height={imageSize}>
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
            alt={`${profile.username || 'User'}'s profile`}
            width="100%"
            height="100%"
            style={{ 
              objectFit: 'cover', 
              borderRadius: '50%',
              display: imageLoading ? 'none' : 'block'
            }}
            onError={handleImageError}
            onLoad={handleImageLoad}
          />
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
        
        {/* Autres informations du profil selon besoin */}
      </Flex>
    </Card>
  );
};

export default React.memo(ProfileCard);