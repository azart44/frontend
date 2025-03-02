// src/types/auth-user.d.ts
import { AuthUser as OriginalAuthUser } from '@aws-amplify/ui-react';

declare module '@aws-amplify/ui-react' {
  interface AuthUser extends OriginalAuthUser {
    attributes?: {
      sub?: string;
      email?: string;
      name?: string;
      'custom:profileCompleted'?: string;
    };
  }
}
