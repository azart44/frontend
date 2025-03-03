import axios from 'axios';
import { fetchAuthSession } from 'aws-amplify/auth';

/**
 * Client API centralisé avec gestion du token d'authentification
 * et des logs de performance
 */
const API_BASE_URL = 'https://z8qzoeztpc.execute-api.us-east-1.amazonaws.com/prod';
const API_TIMEOUT = 15000; // Augmenté à 15 secondes pour les requêtes impliquant des images

// Instance axios avec configuration optimisée
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
  // Désactiver temporairement withCredentials
  withCredentials: false
});

// Interception des requêtes pour ajouter le token
apiClient.interceptors.request.use(async (config) => {
  // Démarrage du chronomètre pour mesurer la performance
  config.metadata = { startTime: performance.now() };
  
  try {
    // Ne pas ajouter manuellement l'en-tête Origin - le navigateur le fait automatiquement
    
    const session = await fetchAuthSession();
    const token = session.tokens?.idToken?.toString();
    if (token) {
      config.headers['Authorization'] = token;
    }
  } catch (error) {
    console.error('Erreur d\'authentification:', error);
    // Continuer sans token si erreur d'authentification
  }
  return config;
}, (error) => Promise.reject(error));

// Interception des réponses pour mesurer la performance et gérer les erreurs
apiClient.interceptors.response.use(
  (response) => {
    if (response.config.metadata) {
      const executionTime = performance.now() - response.config.metadata.startTime;
      response.duration = executionTime;
      
      // Log des requêtes lentes (plus de 1 seconde)
      if (executionTime > 1000) {
        console.warn(`API lente: ${response.config.url} - ${executionTime.toFixed(2)}ms`);
      }
    }
    return response;
  },
  (error) => {
    // Gestion centralisée des erreurs
    if (error.response) {
      // Erreur avec réponse du serveur
      console.error(`Erreur API (${error.response.status}):`, error.response.data);
      
      // Redirection vers login si 401 (non autorisé)
      if (error.response.status === 401) {
        // Éviter les redirections en boucle
        if (window.location.pathname !== '/auth') {
          console.log('Session expirée, redirection vers la page de connexion');
          // window.location.href = '/auth';
        }
      }
    } else if (error.request) {
      // Erreur sans réponse (timeout, etc.)
      console.error('Erreur réseau:', error.message);
    } else {
      // Erreur de configuration
      console.error('Erreur de configuration:', error.message);
    }
    return Promise.reject(error);
  }
);

export default apiClient;