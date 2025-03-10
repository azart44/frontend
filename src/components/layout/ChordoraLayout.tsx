import React, { useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Text, 
  Button, 
  Image,
  useAuthenticator
} from '@aws-amplify/ui-react';
import { 
  FaHome, 
  FaSearch, 
  FaMusic, 
  FaUser, 
  FaHeart,
  FaSignOutAlt,
  FaSignInAlt,
  FaCog,
  FaBars
} from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';
import { useAudioContext } from '../../contexts/AudioContext';
import AudioPlayer from '../common/AudioPlayer';

interface ChordoraLayoutProps {
  children: React.ReactNode;
}

/**
 * Layout principal de l'application avec menu latéral et lecteur audio
 */
const ChordoraLayout: React.FC<ChordoraLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const { signOut } = useAuthenticator(context => [context.signOut]);
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  
  // Contexte audio pour le lecteur
  const { 
    currentTrack, 
    isPlaying, 
    togglePlay, 
    nextTrack, 
    previousTrack,
    currentTime,
    duration,
    seek,
    isLoading,
    volume,
    changeVolume
  } = useAudioContext();

  // Déterminer si le menu est actif
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  // Navigation vers un chemin
  const navigateTo = useCallback((path: string) => {
    navigate(path);
    // Si en mobile, fermer le sidebar après navigation
    if (window.innerWidth <= 768) {
      setSidebarExpanded(false);
    }
  }, [navigate]);

  // Déconnexion
  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  return (
    <div className="chordora-layout">
      <div className="chordora-main-container">
        {/* Sidebar */}
        <div className={`chordora-sidebar ${sidebarExpanded ? 'expanded' : ''}`}>
          {/* Logo */}
          <div style={{ padding: '0.5rem', marginBottom: '2rem' }}>
            <Image
              src="/logo.svg"
              alt="Chordora Logo"
              height={sidebarExpanded ? "40px" : "30px"}
              onClick={() => navigateTo('/')}
              style={{ cursor: 'pointer' }}
            />
          </div>
          
          {/* Mobile menu toggle */}
          <Button
            onClick={() => setSidebarExpanded(!sidebarExpanded)}
            className="sidebar-toggle"
            style={{ 
              display: sidebarExpanded ? 'none' : 'flex',
              marginBottom: '1rem',
              backgroundColor: 'transparent',
              color: 'var(--chordora-text-secondary)'
            }}
          >
            <FaBars />
          </Button>

          {/* Menu items */}
          <div 
            className={`sidebar-item ${isActive('/') ? 'active' : ''}`}
            onClick={() => navigateTo('/')}
          >
            <FaHome className="sidebar-item-icon" />
            {sidebarExpanded && <span className="sidebar-item-text">Accueil</span>}
          </div>
          <div 
            className={`sidebar-item ${isActive('/tracks') ? 'active' : ''}`}
            onClick={() => navigateTo('/tracks')}
          >
            <FaSearch className="sidebar-item-icon" />
            {sidebarExpanded && <span className="sidebar-item-text">Explorer</span>}
          </div>
          
          {isAuthenticated && (
            <>
              <div 
                className={`sidebar-item ${isActive('/favorites') ? 'active' : ''}`}
                onClick={() => navigateTo('/favorites')}
              >
                <FaHeart className="sidebar-item-icon" />
                {sidebarExpanded && <span className="sidebar-item-text">Favoris</span>}
              </div>
              
              <div 
                className={`sidebar-item ${isActive('/profile') ? 'active' : ''}`}
                onClick={() => navigateTo('/profile')}
              >
                <FaUser className="sidebar-item-icon" />
                {sidebarExpanded && <span className="sidebar-item-text">Profil</span>}
              </div>
              
              <div 
                className="sidebar-item"
                onClick={handleLogout}
                style={{ marginTop: 'auto' }}
              >
                <FaSignOutAlt className="sidebar-item-icon" />
                {sidebarExpanded && <span className="sidebar-item-text">Déconnexion</span>}
              </div>
            </>
          )}
          
          {!isAuthenticated && (
            <div 
              className={`sidebar-item ${isActive('/auth') ? 'active' : ''}`}
              onClick={() => navigateTo('/auth')}
              style={{ marginTop: 'auto' }}
            >
              <FaSignInAlt className="sidebar-item-icon" />
              {sidebarExpanded && <span className="sidebar-item-text">Connexion</span>}
            </div>
          )}
        </div>

        {/* Main content */}
        <div className="chordora-main-content">
          <div className="main-content-inner">
            <div className="main-header">
              {/* Search bar */}
              <div className="search-bar">
                <FaSearch className="search-icon" />
                <input 
                  type="text" 
                  placeholder="Rechercher des artistes, pistes..." 
                  onClick={() => navigateTo('/tracks')}
                />
              </div>
              
              {/* User profile */}
              {isAuthenticated ? (
                <Button
                  onClick={() => navigateTo('/profile')}
                  variation="menu"
                  style={{ 
                    borderRadius: '20px', 
                    padding: '0.5rem 1rem',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)'
                  }}
                >
                  <FaUser style={{ marginRight: '0.5rem' }} />
                  Mon Compte
                </Button>
              ) : (
                <Button
                  onClick={() => navigateTo('/auth')}
                  variation="primary"
                  style={{ 
                    borderRadius: '20px', 
                    padding: '0.5rem 1rem',
                    backgroundColor: 'var(--chordora-primary)'
                  }}
                >
                  <FaSignInAlt style={{ marginRight: '0.5rem' }} />
                  Connexion
                </Button>
              )}
            </div>
            
            {/* Main content children */}
            {children}
          </div>
        </div>
      </div>

      {/* Player */}
      {currentTrack && (
        <AudioPlayer 
          track={currentTrack} 
          onClose={() => {
            togglePlay();
          }}
          currentTime={currentTime}
          duration={duration}
          isPlaying={isPlaying}
          isLoading={isLoading}
          volume={volume}
          onPlayPause={togglePlay}
          onNext={nextTrack}
          onPrevious={previousTrack}
          onSeek={seek}
          onVolumeChange={changeVolume}
        />
      )}
    </div>
  );
};

export default ChordoraLayout;