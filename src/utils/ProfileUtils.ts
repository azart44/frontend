/**
 * Utilitaires pour le traitement des profils et des images
 */

// Image de profil par défaut (chemin dans le dossier public)
export const DEFAULT_PROFILE_IMAGE = '/default-profile.jpg';

/**
 * Vérifie et ajoute une extension d'image si nécessaire
 * @param url URL de l'image à vérifier
 * @returns URL avec extension garantie
 */
export const ensureImageExtension = (url: string | undefined): string | undefined => {
  if (!url) return url;
  
  // Si l'URL a déjà une extension connue, la retourner telle quelle
  if (/\.(jpg|jpeg|png|webp|gif)$/i.test(url)) {
    return url;
  }
  
  // Sinon, ajouter .jpg comme extension par défaut
  return `${url}.jpg`;
};

/**
 * Crée un tableau des extensions possibles à essayer pour une image
 * @returns Tableau d'extensions d'images courantes
 */
export const getImageExtensions = (): string[] => {
  return ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
};

/**
 * Génère un ensemble d'URLs alternatives avec différentes extensions
 * @param baseUrl URL de base de l'image sans extension
 * @returns Tableau d'URLs avec différentes extensions
 */
export const generateImageUrlsWithExtensions = (baseUrl: string): string[] => {
  // Si l'URL a déjà une extension, ne retourner que celle-ci
  if (/\.(jpg|jpeg|png|webp|gif)$/i.test(baseUrl)) {
    return [baseUrl];
  }
  
  // Sinon, générer des alternatives avec chaque extension
  return getImageExtensions().map(ext => `${baseUrl}${ext}`);
};

/**
 * Charge une image et retourne la première URL qui fonctionne
 * @param urls Tableau d'URLs à essayer
 * @returns Promise avec l'URL qui a fonctionné ou undefined
 */
export const findWorkingImageUrl = async (urls: string[]): Promise<string | undefined> => {
  // Fonction pour tester une URL d'image
  const testImage = (url: string): Promise<string | undefined> => {
    return new Promise((resolve) => {
      const img = new Image();
      
      img.onload = () => {
        resolve(url);
      };
      
      img.onerror = () => {
        resolve(undefined);
      };
      
      img.src = url;
    });
  };
  
  // Essayer chaque URL en séquence
  for (const url of urls) {
    const result = await testImage(url);
    if (result) {
      return result;
    }
  }
  
  return undefined;
};