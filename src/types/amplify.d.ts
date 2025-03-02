// src/types/amplify.d.ts
import '@aws-amplify/ui-react';

declare module '@aws-amplify/ui-react' {
  // Étend l'interface AuthUser existante
  interface AuthUser {
    username: string;
    // Nous n'utilisons plus attributes qui causait des problèmes de typage
    // Si vous avez besoin d'accéder aux attributs, utilisez fetchUserAttributes() à la place
  }
}