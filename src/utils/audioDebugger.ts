// src/utils/audioDebugger.ts

/**
 * Utilitaire pour déboguer les problèmes de lecture audio
 */
export const validatePresignedUrl = (url: string | undefined): { isValid: boolean; message: string } => {
    if (!url) {
      return { isValid: false, message: "URL présignée manquante ou undefined" };
    }
  
    if (url === "") {
      return { isValid: false, message: "URL présignée vide" };
    }
  
    try {
      // Vérifier si l'URL est bien formée
      const urlObj = new URL(url);
      
      // Vérifier si c'est une URL S3 présignée valide
      const isS3Url = urlObj.hostname.includes('s3') || 
                      urlObj.hostname.includes('amazonaws.com');
      
      // Vérifier si l'URL contient des paramètres de signature
      const hasSignature = urlObj.searchParams.has('X-Amz-Signature') || 
                           urlObj.searchParams.has('Signature');
      
      if (!isS3Url) {
        return { 
          isValid: false, 
          message: `L'URL ne semble pas provenir d'AWS S3: ${urlObj.hostname}` 
        };
      }
      
      if (!hasSignature) {
        return { 
          isValid: false, 
          message: "L'URL ne contient pas de signature AWS" 
        };
      }
      
      return { isValid: true, message: "URL présignée valide" };
    } catch (e) {
      return { 
        isValid: false, 
        message: `URL malformée: ${e instanceof Error ? e.message : String(e)}` 
      };
    }
  };
  
  /**
   * Test l'accessibilité d'une URL audio
   * @param url URL à tester
   * @returns Promise avec le résultat du test
   */
  export const testAudioUrl = async (url: string): Promise<{ success: boolean; message: string }> => {
    try {
      // Faire une requête HEAD pour vérifier l'accessibilité sans télécharger le fichier
      const response = await fetch(url, { method: 'HEAD' });
      
      if (!response.ok) {
        return {
          success: false,
          message: `Erreur HTTP ${response.status}: ${response.statusText}`
        };
      }
      
      // Vérifier le Content-Type
      const contentType = response.headers.get('Content-Type');
      const isAudioFile = contentType && contentType.startsWith('audio/');
      
      if (!isAudioFile) {
        return {
          success: false,
          message: `Type de contenu non audio: ${contentType || 'Inconnu'}`
        };
      }
      
      return {
        success: true,
        message: `URL accessible, type: ${contentType}`
      };
    } catch (e) {
      return {
        success: false,
        message: `Erreur réseau: ${e instanceof Error ? e.message : String(e)}`
      };
    }
  };
  
  /**
   * Crée un élément audio de test
   * @param url URL audio à tester
   * @returns Promise avec les résultats du test
   */
  export const createTestAudio = (url: string): Promise<{ success: boolean; message: string }> => {
    return new Promise((resolve) => {
      const audio = new Audio();
      let timeoutId: number;
      
      // Définir un timeout pour éviter de bloquer trop longtemps
      timeoutId = window.setTimeout(() => {
        cleanup();
        resolve({
          success: false,
          message: "Timeout lors du chargement de l'audio"
        });
      }, 10000);
      
      // Fonction de nettoyage des écouteurs d'événements
      const cleanup = () => {
        window.clearTimeout(timeoutId);
        audio.removeEventListener('canplay', onCanPlay);
        audio.removeEventListener('loadedmetadata', onLoadedMetadata);
        audio.removeEventListener('error', onError);
        audio.src = '';
        audio.load();
      };
      
      // Gestionnaires d'événements
      const onCanPlay = () => {
        cleanup();
        resolve({
          success: true,
          message: `Audio chargé avec succès, durée: ${audio.duration}s`
        });
      };
      
      const onLoadedMetadata = () => {
        // Si l'événement canplay n'est pas déclenché rapidement,
        // on considère que les métadonnées chargées sont un succès
        window.clearTimeout(timeoutId);
        timeoutId = window.setTimeout(() => {
          cleanup();
          resolve({
            success: true,
            message: `Métadonnées chargées, durée: ${audio.duration}s`
          });
        }, 2000);
      };
      
      const onError = () => {
        const errorCode = audio.error ? audio.error.code : 'inconnu';
        const errorMessage = audio.error ? audio.error.message : 'Erreur inconnue';
        
        cleanup();
        resolve({
          success: false,
          message: `Erreur de chargement audio: Code ${errorCode} - ${errorMessage}`
        });
      };
      
      // Configurer les écouteurs d'événements
      audio.addEventListener('canplay', onCanPlay);
      audio.addEventListener('loadedmetadata', onLoadedMetadata);
      audio.addEventListener('error', onError);
      
      // Démarrer le chargement
      console.log("Test de chargement de l'URL:", url);
      audio.crossOrigin = "anonymous";
      audio.src = url;
      audio.load();
    });
  };