import React, { ReactNode, useRef, useEffect } from 'react';
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
  width?: string;
  maxHeight?: string;
}

// Composant Header
const Header: React.FC<{ children: ReactNode, onClose: () => void }> = ({ 
  children, 
  onClose 
}) => (
  <>
    <Flex justifyContent="space-between" alignItems="center" padding="1rem">
      <Heading level={4} style={{ color: 'var(--chordora-text-primary)' }}>{children}</Heading>
      <Button 
        onClick={onClose} 
        variation="link"
        padding="0.5rem"
        style={{
          borderRadius: '50%',
          color: 'var(--chordora-text-secondary)',
          transition: 'background-color 0.2s ease',
          width: '32px',
          height: '32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minWidth: 'unset'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'var(--chordora-hover-bg)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent';
        }}
      >
        <FaTimes size={16} />
      </Button>
    </Flex>
    <Divider style={{ backgroundColor: 'var(--chordora-divider)', margin: 0 }} />
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
    <Divider style={{ backgroundColor: 'var(--chordora-divider)', margin: 0 }} />
    <Flex padding="1rem" justifyContent="flex-end" gap="0.5rem">
      {children}
    </Flex>
  </>
);

/**
 * Composant modal personnalisé pour remplacer le Modal d'Amplify UI
 * Version améliorée avec position fixe et un design cohérent avec Chordora
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
  footer,
  width = '500px',
  maxHeight = '85vh'
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  
  // Empêcher la propagation des clics dans le modal
  const handleModalClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };
  
  // Gestionnaire pour la touche Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);
  
  if (!isOpen) return null;
  
  return (
    <>
      {/* Overlay sombre avec position fixe */}
      <View
        position="fixed"
        top="0"
        left="0"
        right="0"
        bottom="0"
        backgroundColor="rgba(0, 0, 0, 0.7)"
        style={{ 
          zIndex: 1000, 
          backdropFilter: 'blur(2px)',
          animationName: 'fadeIn',
          animationDuration: '0.2s'
        }}
        onClick={onClose}
      />
      
      {/* Contenu de la modal avec position fixe */}
      <View
        ref={modalRef}
        position="fixed"
        left="50%"
        top="50%"
        style={{
          transform: 'translate(-50%, -50%)',
          width,
          maxWidth: '95%',
          maxHeight,
          zIndex: 1001,
          animationName: 'modalIn',
          animationDuration: '0.3s',
          animationTimingFunction: 'cubic-bezier(0.215, 0.610, 0.355, 1.000)'
        }}
        onClick={handleModalClick}
      >
        <Card 
          width="100%"
          height="100%"
          padding="0"
          backgroundColor="var(--chordora-card-bg)"
          borderRadius="8px"
          variation="elevated"
          boxShadow="0 4px 30px rgba(0,0,0,0.5)"
          style={{ 
            overflow: 'hidden',
            display: 'flex', 
            flexDirection: 'column'
          }}
        >
          <Header onClose={onClose}>{title}</Header>
          
          {/* Corps avec scrolling si nécessaire */}
          <View 
            style={{ 
              flexGrow: 1, 
              overflow: 'auto',
              scrollbarWidth: 'thin',
              scrollbarColor: 'var(--chordora-scrollbar-thumb) var(--chordora-scrollbar-track)'
            }}
          >
            {children}
          </View>
          
          {footer && <Footer>{footer}</Footer>}
        </Card>
      </View>
      
      {/* Styles pour les animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes modalIn {
          from { 
            opacity: 0; 
            transform: translate(-50%, -55%);
          }
          to { 
            opacity: 1; 
            transform: translate(-50%, -50%);
          }
        }
        
        /* Style personnalisé pour la scrollbar dans le modal */
        ::-webkit-scrollbar {
          width: 8px;
        }
        
        ::-webkit-scrollbar-track {
          background: var(--chordora-scrollbar-track);
        }
        
        ::-webkit-scrollbar-thumb {
          background: var(--chordora-scrollbar-thumb);
          border-radius: 4px;
        }
      `}</style>
    </>
  );
};

// Attacher les sous-composants
CustomModal.Header = Header;
CustomModal.Body = Body;
CustomModal.Footer = Footer;

export default CustomModal;