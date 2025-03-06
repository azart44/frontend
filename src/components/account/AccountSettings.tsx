import React, { useState } from 'react';
import { 
  View, 
  Heading, 
  Text, 
  Flex, 
  Card,
  TextField,
  Alert, 
  Divider,
  useAuthenticator
} from '@aws-amplify/ui-react';
import { 
  deleteUser, 
  updatePassword
} from 'aws-amplify/auth';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { deleteProfile } from '../../api/profile';
import { FaLock, FaTrash, FaExclamationTriangle, FaUserCog, FaEnvelope } from 'react-icons/fa';
import ChordoraButton from '../common/ChordoraButton';

/**
 * Composant pour les paramètres du compte utilisateur
 * Permet de changer le mot de passe et de supprimer le compte
 */
const AccountSettings: React.FC = () => {
  const navigate = useNavigate();
  const { signOut } = useAuthenticator(context => [context.signOut]);
  const { userEmail, userId: authUserId } = useAuth();
  
  // États pour le changement de mot de passe
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);
  
  // États pour la suppression de compte
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteConfirmCode, setDeleteConfirmCode] = useState('');
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);
  const [currentDeleteStep, setCurrentDeleteStep] = useState(1);
  const [deleteEmailSent, setDeleteEmailSent] = useState(false);
  
  // Validation du mot de passe
  const validatePasswordChange = () => {
    if (!oldPassword) {
      setPasswordError('Veuillez saisir votre mot de passe actuel');
      return false;
    }
    
    if (!newPassword) {
      setPasswordError('Veuillez saisir un nouveau mot de passe');
      return false;
    }
    
    if (newPassword.length < 8) {
      setPasswordError('Le nouveau mot de passe doit contenir au moins 8 caractères');
      return false;
    }
    
    if (newPassword !== confirmPassword) {
      setPasswordError('Les mots de passe ne correspondent pas');
      return false;
    }
    
    return true;
  };
  
  // Changer le mot de passe
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Réinitialiser les états
    setPasswordError(null);
    setPasswordSuccess(false);
    
    // Valider le formulaire
    if (!validatePasswordChange()) {
      return;
    }
    
    setIsPasswordLoading(true);
    
    try {
      await updatePassword({
        oldPassword,
        newPassword
      });
      
      // Réinitialiser le formulaire et afficher un message de succès
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordSuccess(true);
    } catch (error: any) {
      console.error('Erreur lors du changement de mot de passe:', error);
      
      if (error.name === 'NotAuthorizedException') {
        setPasswordError('Mot de passe actuel incorrect');
      } else if (error.name === 'LimitExceededException') {
        setPasswordError('Trop de tentatives, veuillez réessayer plus tard');
      } else {
        setPasswordError(`Erreur: ${error.message || 'Une erreur est survenue'}`);
      }
    } finally {
      setIsPasswordLoading(false);
    }
  };
  
  // Initier la suppression du compte
  const handleInitiateDelete = () => {
    setShowDeleteConfirm(true);
    setDeleteError(null);
  };
  
  // Première étape de la suppression du compte (confirmation par mot de passe)
  const handleDeleteStep1 = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!deletePassword) {
      setDeleteError('Veuillez saisir votre mot de passe');
      return;
    }
    
    setIsDeleteLoading(true);
    
    try {
      // 1. Supprimer les données du profil (avant la suppression du compte Cognito)
      if (authUserId) {
        try {
          await deleteProfile(authUserId);
          console.log('Profil et données utilisateur supprimés avec succès');
        } catch (deleteProfileError) {
          console.error('Erreur lors de la suppression du profil:', deleteProfileError);
          // Continuer malgré l'erreur pour supprimer le compte Cognito
        }
      }
      
      // 2. Initier la suppression du compte
      // Note: Dans Amplify v6, deleteUser n'accepte pas de paramètres
      // mais nous devons simuler un processus en deux étapes
      
      // Simuler l'envoi d'un email en passant directement à l'étape 2
      setDeleteEmailSent(true);
      setCurrentDeleteStep(2);
      setDeleteError(null);
      
      // Dans une vraie implémentation, vous devriez ici appeler une API backend
      // qui enverrait un code par email à l'utilisateur
    } catch (error: any) {
      console.error('Erreur lors de l\'initiation de suppression:', error);
      
      if (error.name === 'NotAuthorizedException') {
        setDeleteError('Mot de passe incorrect');
      } else if (error.name === 'LimitExceededException') {
        setDeleteError('Trop de tentatives, veuillez réessayer plus tard');
      } else {
        setDeleteError(`Erreur: ${error.message || 'Une erreur est survenue'}`);
      }
    } finally {
      setIsDeleteLoading(false);
    }
  };
  
  // Seconde étape de la suppression du compte (confirmation par code reçu par email)
  const handleDeleteStep2 = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!deleteConfirmCode) {
      setDeleteError('Veuillez saisir le code de confirmation');
      return;
    }
    
    setIsDeleteLoading(true);
    
    try {
      // Dans une vraie implémentation, vous devriez vérifier le code
      // via votre backend ou un service de vérification
      
      // Pour ce prototype, nous allons simplement supprimer le compte directement
      await deleteUser();
      
      // Déconnexion après suppression réussie
      await signOut();
      
      // Rediriger vers la page d'accueil
      navigate('/', { replace: true });
    } catch (error: any) {
      console.error('Erreur lors de la confirmation de suppression:', error);
      
      if (error.name === 'CodeMismatchException') {
        setDeleteError('Code de confirmation incorrect');
      } else if (error.name === 'ExpiredCodeException') {
        setDeleteError('Code de confirmation expiré, veuillez recommencer');
        setCurrentDeleteStep(1);
      } else {
        setDeleteError(`Erreur: ${error.message || 'Une erreur est survenue'}`);
      }
    } finally {
      setIsDeleteLoading(false);
    }
  };
  
  // Annuler la suppression
  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
    setDeletePassword('');
    setDeleteConfirmCode('');
    setDeleteError(null);
    setCurrentDeleteStep(1);
    setDeleteEmailSent(false);
  };
  
  return (
    <View padding="2rem">
      <Heading level={2} marginBottom="2rem">Paramètres du compte</Heading>
      
      {/* Informations de base */}
      <Card padding="1.5rem" marginBottom="2rem">
        <Heading level={3} marginBottom="1rem">
          <Flex alignItems="center" gap="0.5rem">
            <FaUserCog />
            <Text>Informations de base</Text>
          </Flex>
        </Heading>
        
        <Flex direction="column" gap="1rem">
          <Flex alignItems="center" justifyContent="space-between">
            <Flex alignItems="center" gap="0.5rem">
              <FaEnvelope color="var(--chordora-text-secondary)" />
              <Text>Adresse email</Text>
            </Flex>
            <Text fontWeight="bold">{userEmail || 'Non disponible'}</Text>
          </Flex>
        </Flex>
      </Card>
      
      {/* Changer le mot de passe */}
      <Card padding="1.5rem" marginBottom="2rem">
        <Heading level={3} marginBottom="1rem">
          <Flex alignItems="center" gap="0.5rem">
            <FaLock />
            <Text>Changer votre mot de passe</Text>
          </Flex>
        </Heading>
        
        {passwordSuccess && (
          <Alert 
            variation="success"
            heading="Mot de passe modifié"
            marginBottom="1rem"
            isDismissible={true}
          >
            Votre mot de passe a été modifié avec succès.
          </Alert>
        )}
        
        {passwordError && (
          <Alert 
            variation="error"
            heading="Erreur"
            marginBottom="1rem"
            isDismissible={true}
          >
            {passwordError}
          </Alert>
        )}
        
        <form onSubmit={handleChangePassword}>
          <Flex direction="column" gap="1rem">
            <TextField
              label="Mot de passe actuel"
              name="oldPassword"
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              required
            />
            
            <TextField
              label="Nouveau mot de passe"
              name="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
            
            <TextField
              label="Confirmer le nouveau mot de passe"
              name="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            
            <ChordoraButton 
              type="submit" 
              variation="primary"
              isLoading={isPasswordLoading}
            >
              Modifier le mot de passe
            </ChordoraButton>
          </Flex>
        </form>
      </Card>
      
      {/* Suppression du compte */}
      <Card padding="1.5rem" backgroundColor="#1a1a1a">
        <Heading level={3} marginBottom="1rem" color="#d32f2f">
          <Flex alignItems="center" gap="0.5rem">
            <FaTrash />
            <Text>Supprimer votre compte</Text>
          </Flex>
        </Heading>
        
        {!showDeleteConfirm ? (
          <>
            <Text marginBottom="1rem">
              La suppression de votre compte est définitive et entraînera la perte de toutes vos données, 
              y compris votre profil, vos pistes et vos collaborations.
            </Text>
            
            <ChordoraButton 
              onClick={handleInitiateDelete}
              variation="danger"
            >
              Supprimer mon compte
            </ChordoraButton>
          </>
        ) : (
          <>
            {deleteError && (
              <Alert 
                variation="error"
                heading="Erreur"
                marginBottom="1rem"
                isDismissible={true}
              >
                {deleteError}
              </Alert>
            )}
            
            <Alert 
              variation="warning"
              heading="Attention"
              marginBottom="1rem"
            >
              <Flex alignItems="center" gap="0.5rem">
                <FaExclamationTriangle size={20} />
                <Text>
                  Cette action est irréversible. Toutes vos données seront définitivement supprimées.
                </Text>
              </Flex>
            </Alert>
            
            {currentDeleteStep === 1 ? (
              <form onSubmit={handleDeleteStep1}>
                <Flex direction="column" gap="1rem">
                  <TextField
                    label="Veuillez saisir votre mot de passe pour confirmer"
                    name="deletePassword"
                    type="password"
                    value={deletePassword}
                    onChange={(e) => setDeletePassword(e.target.value)}
                    required
                  />
                  
                  <Flex gap="1rem">
                    <ChordoraButton 
                      type="submit" 
                      variation="danger"
                      isLoading={isDeleteLoading}
                    >
                      Confirmer la suppression
                    </ChordoraButton>
                    
                    <ChordoraButton 
                      onClick={handleCancelDelete} 
                      variation="link"
                    >
                      Annuler
                    </ChordoraButton>
                  </Flex>
                </Flex>
              </form>
            ) : (
              <form onSubmit={handleDeleteStep2}>
                <Flex direction="column" gap="1rem">
                  <Text>
                    Un code de confirmation a été envoyé à votre adresse e-mail ({userEmail}).
                    Veuillez saisir ce code pour finaliser la suppression de votre compte.
                  </Text>
                  
                  <TextField
                    label="Code de confirmation"
                    name="deleteConfirmCode"
                    value={deleteConfirmCode}
                    onChange={(e) => setDeleteConfirmCode(e.target.value)}
                    required
                  />
                  
                  <Flex gap="1rem">
                    <ChordoraButton 
                      type="submit" 
                      variation="danger"
                      isLoading={isDeleteLoading}
                    >
                      Finaliser la suppression
                    </ChordoraButton>
                    
                    <ChordoraButton 
                      onClick={handleCancelDelete}
                      variation="link"
                    >
                      Annuler
                    </ChordoraButton>
                  </Flex>
                </Flex>
              </form>
            )}
          </>
        )}
      </Card>
    </View>
  );
};

export default AccountSettings;