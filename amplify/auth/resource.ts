import { defineAuth } from '@aws-amplify/backend';

export const auth = defineAuth({
  loginWith: {
    email: true,
    // Vous pouvez ajouter d'autres options ici selon vos besoins
  }
});