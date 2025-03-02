import React, { useState, useMemo } from 'react';
import { 
  Card, 
  Heading, 
  Text, 
  Badge, 
  Flex, 
  Image, 
  Loader,
  View,
  Grid,
  Divider
} from '@aws-amplify/ui-react';
import { useNavigate } from 'react-router-dom';
import { UserProfile } from '../../types/ProfileTypes';
import { FaInstagram, FaSoundcloud, FaYoutube, FaTwitter, FaMusic, FaLaptop, FaMapMarkerAlt } from 'react-icons/fa';

// Chemin de l'image par défaut (dans le dossier public)
const DEFAULT_IMAGE_PATH = '/default-profile.jpg';

interface ProfileCardProps {
  profile: UserProfile;
  isPreview?: boolean;
  showExtendedInfo?: boolean;
}

const ProfileCard: React.FC<ProfileCardProps> = React.memo(({ 
  profile, 
  isPreview = false,
  showExtendedInfo = true 
}) => {
  const navigate = useNavigate();
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  
  // Déterminer si on affiche les informations détaillées
  const shouldShowDetails = !isPreview && showExtendedInfo;
  
  // Memoize the profile image source
  const profileImageSrc = useMemo(() => {
    // Si erreur détectée, utiliser l'image par défaut
    if (imageError) {
      return DEFAULT_IMAGE_PATH;
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
    
    // Fallback: image par défaut
    return DEFAULT_IMAGE_PATH;
  }, [profile.profileImageUrl, profile.profileImageBase64, imageError]);
  
  // Optimiser le rendu conditionnel des réseaux sociaux
  const renderSocialIcons = useMemo(() => {
    if (!profile.socialLinks) return null;
    
    return (
      <Flex marginTop="0.5rem" gap="0.75rem" justifyContent="center">
        {profile.socialLinks.instagram && (
          <FaInstagram 
            size={22} 
            onClick={() => window.open(profile.socialLinks?.instagram, '_blank')} 
            style={{ cursor: 'pointer', color: '#E1306C' }} 
            aria-label="Instagram"
            title="Instagram"
          />
        )}
        {profile.socialLinks.soundcloud && (
          <FaSoundcloud 
            size={22} 
            onClick={() => window.open(profile.socialLinks?.soundcloud, '_blank')} 
            style={{ cursor: 'pointer', color: '#FF3300' }} 
            aria-label="SoundCloud"
            title="SoundCloud"
          />
        )}
        {profile.socialLinks.youtube && (
          <FaYoutube 
            size={22} 
            onClick={() => window.open(profile.socialLinks?.youtube, '_blank')} 
            style={{ cursor: 'pointer', color: '#FF0000' }} 
            aria-label="YouTube"
            title="YouTube"
          />
        )}
        {profile.socialLinks.twitter && (
          <FaTwitter 
            size={22} 
            onClick={() => window.open(profile.socialLinks?.twitter, '_blank')} 
            style={{ cursor: 'pointer', color: '#1DA1F2' }} 
            aria-label="Twitter"
            title="Twitter"
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
  
  // Handler pour les erreurs d'image
  const handleImageError = () => {
    console.error('Erreur lors du chargement de l\'image de profil:', {
      profileImageUrl: profile.profileImageUrl,
      hasBase64: !!profile.profileImageBase64
    });
    setImageError(true);
    setImageLoading(false);
  };
  
  // Handler pour quand l'image est chargée
  const handleImageLoad = () => {
    setImageLoading(false);
  };
  
  // Dimensions de l'image selon le mode
  const imageSize = isPreview ? "80px" : "150px";
  
  return (
    <Card 
      variation="elevated"
      padding={isPreview ? "1rem" : "2rem"}
      onClick={isPreview ? handleCardClick : undefined}
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
              <Flex alignItems="center" gap="0.25rem">
                <FaMapMarkerAlt size={12} />
                {profile.location}
              </Flex>
            </Badge>
          )}
        </Flex>
        
        {/* Afficher les tags s'ils existent */}
        {profile.tags && profile.tags.length > 0 && (
          <Flex marginTop="0.75rem" gap="0.5rem" wrap="wrap" justifyContent="center">
            {profile.tags.map(tag => (
              <Badge key={tag} variation="info" size="small">#{tag}</Badge>
            ))}
          </Flex>
        )}
        
        {renderSocialIcons}
        
        {/* Bio */}
        {!isPreview && profile.bio && (
          <Text marginTop="1rem" textAlign="center">{profile.bio}</Text>
        )}

        {/* Informations étendues (équipement et genres musicaux) */}
        {shouldShowDetails && (
          <>
            <Divider marginTop="1.5rem" marginBottom="1.5rem" />
            
            <Grid templateColumns="1fr" gap="1rem" width="100%">
              {/* Logiciel et équipement */}
              {(profile.software || (profile.equipment && profile.equipment.length > 0)) && (
                <View>
                  <Heading level={5} marginBottom="0.5rem">
                    <Flex alignItems="center" gap="0.5rem">
                      <FaLaptop />
                      Équipement
                    </Flex>
                  </Heading>
                  
                  {profile.software && (
                    <Text marginBottom="0.5rem">
                      <strong>Logiciel principal :</strong> {profile.software}
                    </Text>
                  )}
                  
                  {profile.equipment && profile.equipment.length > 0 && (
                    <Flex gap="0.5rem" wrap="wrap">
                      {profile.equipment.map(item => (
                        <Badge key={item} variation="warning" size="small">{item}</Badge>
                      ))}
                    </Flex>
                  )}
                </View>
              )}
              
              {/* Genres et mood musicaux */}
              {((profile.musicGenres && profile.musicGenres.length > 0) || profile.musicalMood) && (
                <View>
                  <Heading level={5} marginBottom="0.5rem">
                    <Flex alignItems="center" gap="0.5rem">
                      <FaMusic />
                      Style musical
                    </Flex>
                  </Heading>
                  
                  {profile.musicGenres && profile.musicGenres.length > 0 && (
                    <Flex gap="0.5rem" wrap="wrap" marginBottom="0.5rem">
                      {profile.musicGenres.map(genre => (
                        <Badge key={genre} variation="info" size="small">{genre}</Badge>
                      ))}
                    </Flex>
                  )}
                  
                  {profile.musicalMood && (
                    <Text>
                      <strong>Mood :</strong> {profile.musicalMood}
                    </Text>
                  )}
                </View>
              )}
              
              {/* Artistes favoris */}
              {profile.favoriteArtists && profile.favoriteArtists.length > 0 && (
                <View>
                  <Heading level={5} marginBottom="0.5rem">Artistes préférés</Heading>
                  <Text>{profile.favoriteArtists.join(', ')}</Text>
                </View>
              )}
            </Grid>
          </>
        )}
      </Flex>
    </Card>
  );
});

ProfileCard.displayName = 'ProfileCard';
export default ProfileCard;