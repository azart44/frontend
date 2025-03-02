import { getUrl, list } from '@aws-amplify/storage';
import localforage from 'localforage';

export const DEFAULT_PROFILE_IMAGE = 'default-profile.jpg';

export const getProfileImageUrl = async (imageKey: string): Promise<string | null> => {
  try {
    console.log('Getting URL for image key:', imageKey);
    const { url } = await getUrl({ key: imageKey, options: { expiresIn: 3600 } });
    console.log('Retrieved URL:', url);
    return url ? url.toString() : null;
  } catch (error) {
    console.error('Error getting profile image URL:', error);
    return null;
  }
};

export const fetchProfileImage = async (username: string): Promise<string | null> => {
  const cacheKey = `profileImage_${username}`;
  
  // Vérifier d'abord le cache
  const cachedUrl = await localforage.getItem<string>(cacheKey);
  if (cachedUrl) {
    console.log('Using cached image URL');
    return cachedUrl;
  }

  // Utiliser une extension de fichier explicite
  const imageKey = `users/${username}/profile-image.jpg`;
  console.log('Fetching image for key:', imageKey);
  
  try {
    const imageExists = await list({ prefix: imageKey });
    console.log('Image exists:', imageExists.items.length > 0);
    
    if (imageExists.items.length > 0) {
      const imageUrl = await getProfileImageUrl(imageKey);
      console.log('Retrieved image URL:', imageUrl);
      if (imageUrl) {
        // Mettre en cache pour les futures requêtes
        await localforage.setItem(cacheKey, imageUrl);
      }
      return imageUrl;
    } else {
      console.log('Using default image');
      const defaultImageUrl = await getProfileImageUrl(DEFAULT_PROFILE_IMAGE);
      console.log('Default image URL:', defaultImageUrl);
      return defaultImageUrl;
    }
  } catch (error) {
    console.error('Error fetching profile image:', error);
    return null;
  }
};