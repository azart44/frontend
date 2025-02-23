import { Amplify } from 'aws-amplify';

Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: process.env.REACT_APP_USER_POOL_ID!,
      userPoolClientId: process.env.REACT_APP_USER_POOL_CLIENT_ID!,
      signUpVerificationMethod: 'code',
      identityPoolId: process.env.REACT_APP_IDENTITY_POOL_ID!, // Utilisez l'assertion non-null
    }
  },
  Storage: {
    S3: {
      bucket: process.env.REACT_APP_S3_BUCKET!,
      region: process.env.REACT_APP_REGION!,
    }
  }
});

export default Amplify;