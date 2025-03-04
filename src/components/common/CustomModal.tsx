import React, { ReactNode } from 'react';
import { 
  Card, 
  Heading, 
  Flex, 
  Button, 
  Divider,
  View
} from '@aws-amplify/ui-react';
import { FaTimes } from 'react-icons/fa';

// Props du composant
interface CustomModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
}

// Composant Header
const Header: React.FC<{ children: ReactNode, onClose: () => void }> = ({ 
  children, 
  onClose 
}) => (
  <>
    <Flex justifyContent="space-between" alignItems="center" padding="1rem">
      <Heading level={4}>{children}</Heading>
      <Button 
        onClick={onClose} 
        variation="link"
        padding="0"
      >
        <FaTimes size={20} />
      </Button>
    </Flex>
    <Divider />
  </>
);

// Composant Body
const Body: React.FC<{ children: ReactNode }> = ({ children }) => (
  <View padding="1rem">
    {children}
  </View>
);

// Composant Footer
const Footer: React.FC<{ children: ReactNode }> = ({ children }) => (
  <>
    <Divider />
    <Flex padding="1rem" justifyContent="center">
      {children}
    </Flex>
  </>
);

/**
 * Composant modal personnalisé pour remplacer le Modal d'Amplify UI
 */
const CustomModal: React.FC<CustomModalProps> & {
  Header: typeof Header;
  Body: typeof Body;
  Footer: typeof Footer;
} = ({ 
  isOpen, 
  onClose, 
  title,
  children,
  footer 
}) => {
  if (!isOpen) return null;
  
  return (
    <>
      {/* Overlay sombre */}
      <View
        position="fixed"
        top="0"
        left="0"
        right="0"
        bottom="0"
        backgroundColor="rgba(0, 0, 0, 0.5)"
        style={{ zIndex: 999 }}
        onClick={onClose}
      />
      
      {/* Contenu de la modal */}
      <Card 
        position="fixed"
        left="50%"
        top="50%"
        style={{
          transform: 'translate(-50%, -50%)',
          maxWidth: '600px',
          width: '90%',
          maxHeight: '80vh',
          zIndex: 1000,
          overflowY: 'auto',
          boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
        }}
      >
        <Header onClose={onClose}>{title}</Header>
        {children}
        {footer && <Footer>{footer}</Footer>}
      </Card>
    </>
  );
};

// Attacher les sous-composants
CustomModal.Header = Header;
CustomModal.Body = Body;
CustomModal.Footer = Footer;

export default CustomModal;