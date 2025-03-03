import React, { useState, useMemo, useEffect } from 'react';
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
import { getUrl } from 'aws-amplify/storage';
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
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Extraire le chemin de l'image de profil sans slash initial
  const profileImageKey = useMemo(() => {
    if (profile.profileImageUrl) {
      // Extraire la clé S3 à partir de l'URL complète
      const matches = profile.profileImageUrl.match(/\/public\/users\/([^/]+)\/profile-image/);
      const key = matches ? matches[0].replace(/^\//, '') : null;
      return key;
    }
    return null;
  }, [profile.profileImageUrl]);

  // Récupérer l'URL signée
  useEffect(() => {
    const fetchImageUrl = async () => {
      // Fallback sur l'image base64 ou l'image par défaut
      const fallbackToDefault = () => {
        if (profile.profileImageBase64) {
          setImageUrl(profile.profileImageBase64);
        } else {
          setImageUrl('/default-profile.jpg');
        }
        setIsLoading(false);
      };

      // Si aucune clé d'image, utiliser le fallback
      if (!profileImageKey) {
        fallbackToDefault();
        return;
      }

      try {
        setIsLoading(true);
        const { url } = await getUrl({
          path: profileImageKey,
          options: {
            validateObjectExistence: true
          }
        });
        setImageUrl(url.toString());
      } catch (error) {
        console.error('Erreur de récupération de l\'image:', error);
        // En cas d'erreur, utiliser le fallback
        fallbackToDefault();
        setImageError(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchImageUrl();
  }, [profileImageKey, profile.profileImageBase64]);

  // Dimensions de l'image
  const imageSize = isPreview ? "80px" : "150px";
  
  return (
    <Card variation="elevated" padding={isPreview ? "1rem" : "2rem"}>
      <Flex direction="column" alignItems="center">
        {isLoading ? (
          <Loader />
        ) : (
          <Image
            src={imageError ? '/default-profile.jpg' : (imageUrl || '/default-profile.jpg')}
            alt={`${profile.username || 'User'}'s profile`}
            width={imageSize}
            height={imageSize}
            objectFit="cover"
            borderRadius="50%"
            onError={() => {
              console.error('Image loading error', {
                profileImageUrl: profile.profileImageUrl,
                imageUrl,
                hasBase64: !!profile.profileImageBase64,
                imageKey: profileImageKey
              });
              setImageError(true);
            }}
          />
        )}
        
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
          <>
            {profile.bio && (
              <Text 
                marginTop="1rem" 
                textAlign="center" 
                fontSize="small" 
                color="gray"
              >
                {profile.bio}
              </Text>
            )}

            {profile.musicGenres && profile.musicGenres.length > 0 && (
              <Flex wrap="wrap" gap="0.5rem" marginTop="1rem" justifyContent="center">
                {profile.musicGenres.map(genre => (
                  <Badge key={genre} variation="info" size="small">
                    {genre}
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