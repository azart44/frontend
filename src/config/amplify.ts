import { Amplify } from 'aws-amplify';
import { envConfig, environment } from './environment';

// Configuration d'Amplify avec les valeurs de l'environnement actuel
Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: envConfig.userPoolId,
      userPoolClientId: envConfig.userPoolClientId,
      signUpVerificationMethod: 'code',
      identityPoolId: envConfig.identityPoolId,
    }
  },
  Storage: {
    S3: {
      bucket: envConfig.s3Bucket,
      region: envConfig.region,
    }
  }
});

console.log(`Amplify configuré pour l'environnement: ${environment.toUpperCase()}`);

export default Amplify;