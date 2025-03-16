// Détection de l'environnement basée sur l'URL
const getEnvironment = () => {
    const hostname = window.location.hostname;
    
    if (hostname === 'app.chordora.com') {
      return 'production';
    } else if (hostname === 'dev.app.chordora.com') {
      return 'development';
    } else if (hostname === 'localhost' || hostname === '127.0.0.1') {
      // Environnement local de développement
      return 'development';
    } else {
      // Environnement par défaut pour les autres URLs
      console.log(`Hostname non reconnu: ${hostname}, utilisation de l'environnement de développement`);
      return 'development';
    }
  };
  
  // Obtenir l'environnement actuel
  export const environment = getEnvironment();
  
  // Configuration selon l'environnement
  const config = {
    production: {
      userPoolId: 'us-east-1_iELPedS4W',
      userPoolClientId: '6ujbmi8coqbjmclqnc3d0ua5c5',
      identityPoolId: 'us-east-1:62d067f0-70de-45ed-8742-5a8ae3a19708',
      apiUrl: 'https://z8qzoeztpc.execute-api.us-east-1.amazonaws.com/prod',
      s3Bucket: 'chordora-users',
      region: 'us-east-1'
    },
    development: {
      userPoolId: 'eu-west-1_1BFoXVehi', // À remplacer par vos vraies valeurs
      userPoolClientId: '70r7gtnk5nu39lmh0tnkm9v720',
      identityPoolId: 'eu-west-1:72c40b45-a676-4248-9306-aa2e0d4921c0',
      apiUrl: 'https://dev-api.execute-api.us-east-1.amazonaws.com/dev',
      s3Bucket: 'chordora-users-dev',
      region: 'eu-west-1'
    }
  };
  
  // Exporter la configuration pour l'environnement actuel
  export const envConfig = config[environment as keyof typeof config];
  export const isProduction = environment === 'production';
  export const isDevelopment = environment === 'development';
  
  console.log(`Application configurée pour l'environnement: ${environment.toUpperCase()}`);
  console.log(`URL API: ${envConfig.apiUrl}`);