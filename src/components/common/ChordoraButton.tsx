import React from 'react';
import { Button, ButtonProps } from '@aws-amplify/ui-react';

/**
 * Types de variations pour le bouton Chordora
 */
export type ChordoraButtonVariation = 
  | 'primary'    // Bouton principal - violet (#6C44FC)
  | 'secondary'  // Bouton secondaire - vert (#87e54c)
  | 'warning'    // Bouton d'avertissement - orange (#FF9800)
  | 'danger'     // Bouton de danger - rouge (#FF5252)
  | 'dark'       // Bouton sombre - noir avec bordure (#282c34)
  | 'light'      // Bouton clair - blanc avec bordure (#FFFFFF)
  | 'link'       // Bouton lien - sans fond
  | 'menu';      // Bouton de menu - gris clair (#2a2d36)

/**
 * Types de tailles pour le bouton Chordora
 */
export type ChordoraButtonSize = 'small' | 'medium' | 'large';

/**
 * Props pour le composant ChordoraButton
 */
export interface ChordoraButtonProps extends Omit<ButtonProps, 'variation' | 'size'> {
  /**
   * Variation de style du bouton
   * @default 'primary'
   */
  variation?: ChordoraButtonVariation;
  
  /**
   * Taille du bouton
   * @default 'medium'
   */
  size?: ChordoraButtonSize;
  
  /**
   * Si le bouton doit avoir un style arrondi
   * @default false
   */
  rounded?: boolean;
  
  /**
   * Si le bouton doit être entièrement rond (cercle)
   * @default false
   */
  circle?: boolean;
  
  /**
   * Si le bouton doit avoir une icône uniquement, sans texte
   * @default false
   */
  iconOnly?: boolean;
  
  /**
   * Contenu du bouton
   */
  children: React.ReactNode;
}

/**
 * Composant de bouton Chordora
 * Un bouton standardisé qui respecte la charte graphique de Chordora
 */
const ChordoraButton: React.FC<ChordoraButtonProps> = ({
  variation = 'primary',
  size = 'medium',
  rounded = false,
  circle = false,
  iconOnly = false,
  children,
  style,
  ...rest
}) => {
  // Définir les styles pour chaque variation
  const getVariationStyle = (): React.CSSProperties => {
    switch (variation) {
      case 'primary':
        return {
          backgroundColor: 'var(--chordora-primary)',
          color: 'white',
          border: 'none'
        };
      case 'secondary':
        return {
          backgroundColor: 'var(--chordora-secondary)',
          color: 'black',
          border: 'none'
        };
      case 'warning':
        return {
          backgroundColor: '#FF9800',
          color: 'white',
          border: 'none'
        };
      case 'danger':
        return {
          backgroundColor: '#FF5252',
          color: 'white',
          border: 'none'
        };
      case 'dark':
        return {
          backgroundColor: '#282c34',
          color: 'white',
          border: '1px solid #444'
        };
      case 'light':
        return {
          backgroundColor: '#FFFFFF',
          color: '#282c34',
          border: '1px solid #e0e0e0'
        };
      case 'link':
        return {
          backgroundColor: 'transparent',
          color: 'var(--chordora-primary)',
          border: 'none',
          padding: '0',
          textDecoration: 'none'
        };
      case 'menu':
        return {
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          color: 'var(--chordora-text-primary)',
          border: 'none'
        };
      default:
        return {};
    }
  };

  // Définir les styles pour chaque taille
  const getSizeStyle = (): React.CSSProperties => {
    switch (size) {
      case 'small':
        return {
          padding: iconOnly ? '0.3rem' : '0.3rem 0.7rem',
          fontSize: '0.8rem',
          minWidth: iconOnly ? '32px' : 'auto',
          height: iconOnly ? '32px' : 'auto'
        };
      case 'medium':
        return {
          padding: iconOnly ? '0.5rem' : '0.5rem 1rem',
          fontSize: '0.9rem',
          minWidth: iconOnly ? '40px' : 'auto',
          height: iconOnly ? '40px' : 'auto'
        };
      case 'large':
        return {
          padding: iconOnly ? '0.7rem' : '0.7rem 1.5rem',
          fontSize: '1rem',
          minWidth: iconOnly ? '48px' : 'auto',
          height: iconOnly ? '48px' : 'auto'
        };
      default:
        return {};
    }
  };

  // Combiner tous les styles
  const combinedStyle: React.CSSProperties = {
    borderRadius: circle ? '50%' : rounded ? '20px' : '4px',
    fontWeight: 500,
    transition: 'all 0.2s ease',
    boxShadow: variation !== 'link' ? '0 2px 4px rgba(0,0,0,0.1)' : 'none',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    cursor: 'pointer',
    ...getVariationStyle(),
    ...getSizeStyle(),
    ...style
  };

  // Effets de survol personnalisés à ajouter via CSS
  const hoverClass = `chordora-button-${variation}`;

  return (
    <>
      <Button
        style={combinedStyle}
        className={`chordora-button ${hoverClass}`}
        {...rest}
      >
        {children}
      </Button>
      
      {/* Styles CSS pour les effets de survol */}
      <style>
        {`
        .chordora-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0,0,0,0.15);
        }
        
        .chordora-button-link:hover {
          transform: none;
          box-shadow: none;
          text-decoration: underline;
        }
        
        .chordora-button-primary:hover {
          background-color: #5B38DF;
        }
        
        .chordora-button-secondary:hover {
          background-color: #78D63C;
        }
        
        .chordora-button-warning:hover {
          background-color: #F08900;
        }
        
        .chordora-button-danger:hover {
          background-color: #FF3B3B;
        }
        
        .chordora-button-menu:hover {
          background-color: rgba(255, 255, 255, 0.2);
        }
        `}
      </style>
    </>
  );
};

export default ChordoraButton;