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
  FaVolumeMute,
  FaVolumeUp,
  FaRandom,
  FaStepBackward,
  FaStepForward,
  FaPlay,
  FaPause,
  FaRedo,
  FaEllipsisH,
  FaBars
} from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';
import { useAudioContext } from '../../contexts/AudioContext';

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
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  
  // Contexte audio pour le lecteur
  const { 
    currentTrack, 
    isPlaying, 
    togglePlay, 
    nextTrack, 
    previousTrack,
    currentTime,
    duration,
    seek
  } = useAudioContext();

  // Gérer le déplacement dans la barre de progression
  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!duration) return;
    
    const progressBar = e.currentTarget;
    const rect = progressBar.getBoundingClientRect();
    const clickPosition = e.clientX - rect.left;
    const percentage = clickPosition / rect.width;
    const newTime = percentage * duration;
    
    seek(newTime);
  };

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

  // Formater le temps (secondes vers MM:SS)
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Calculer le pourcentage de progression
  const progressPercentage = duration ? (currentTime / duration) * 100 : 0;

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
            className={`sidebar-item ${isActive('/users') ? 'active' : ''}`}
            onClick={() => navigateTo('/users')}
          >
            <FaSearch className="sidebar-item-icon" />
            {sidebarExpanded && <span className="sidebar-item-text">Explorer</span>}
          </div>
          
          {isAuthenticated && (
            <>
              <div 
                className={`sidebar-item ${isActive('/profile') ? 'active' : ''}`}
                onClick={() => navigateTo('/profile')}
              >
                <FaUser className="sidebar-item-icon" />
                {sidebarExpanded && <span className="sidebar-item-text">Mon Profil</span>}
              </div>
              
              <div 
                className={`sidebar-item ${isActive('/add-track') ? 'active' : ''}`}
                onClick={() => navigateTo('/add-track')}
              >
                <FaMusic className="sidebar-item-icon" />
                {sidebarExpanded && <span className="sidebar-item-text">Ajouter une piste</span>}
              </div>
              
              <div 
                className={`sidebar-item ${isActive('/favorites') ? 'active' : ''}`}
                onClick={() => navigateTo('/favorites')}
              >
                <FaHeart className="sidebar-item-icon" />
                {sidebarExpanded && <span className="sidebar-item-text">Favoris</span>}
              </div>
              
              <div 
                className={`sidebar-item ${isActive('/account-settings') ? 'active' : ''}`}
                onClick={() => navigateTo('/account-settings')}
              >
                <FaCog className="sidebar-item-icon" />
                {sidebarExpanded && <span className="sidebar-item-text">Paramètres</span>}
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
                <input type="text" placeholder="Rechercher des artistes, pistes..." />
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
        <div className="chordora-player">
          {/* Track info */}
          <div className="player-track-info">
            <Image
              src={currentTrack.cover_image || '/default-cover.jpg'}
              alt={currentTrack.title}
              width="60px"
              height="60px"
              style={{ 
                objectFit: 'cover',
                borderRadius: '4px',
                marginRight: '1rem'
              }}
            />
            <div>
              <Text 
                fontWeight="bold"
                className="text-truncate"
                style={{ maxWidth: '200px' }}
              >
                {currentTrack.title}
              </Text>
              <Text 
                fontSize="0.8rem" 
                color="var(--chordora-text-secondary)"
                className="text-truncate"
                style={{ maxWidth: '200px' }}
              >
                {currentTrack.artist}
              </Text>
            </div>
            <Button 
              variation="link"
              size="small"
              style={{ marginLeft: '1rem' }}
            >
              <FaHeart color="#A0A0A0" />
            </Button>
            <Button 
              variation="link"
              size="small"
            >
              <FaEllipsisH color="#A0A0A0" />
            </Button>
          </div>
          
          {/* Player controls */}
          <div className="player-controls">
            <div className="player-buttons">
              <button className="player-control-button">
                <FaRandom />
              </button>
              <button 
                className="player-control-button"
                onClick={previousTrack}
              >
                <FaStepBackward />
              </button>
              <button 
                className="player-control-button play-pause"
                onClick={togglePlay}
              >
                {isPlaying ? <FaPause /> : <FaPlay />}
              </button>
              <button 
                className="player-control-button"
                onClick={nextTrack}
              >
                <FaStepForward />
              </button>
              <button className="player-control-button">
                <FaRedo />
              </button>
            </div>
            
            <div className="player-progress">
              <Text fontSize="0.8rem" style={{ minWidth: '40px' }}>
                {formatTime(currentTime)}
              </Text>
              
              <div 
                className="player-progress-bar"
                onClick={handleProgressClick}
              >
                <div 
                  className="player-progress-current"
                  style={{ width: `${progressPercentage}%` }}
                ></div>
                <div
                  className="player-progress-thumb"
                  style={{ left: `${progressPercentage}%` }}
                ></div>
              </div>
              
              <Text fontSize="0.8rem" style={{ minWidth: '40px' }}>
                {formatTime(duration)}
              </Text>
            </div>
          </div>
          
          {/* Volume */}
          <div className="player-volume">
            <button 
              className="player-control-button"
              onClick={() => setIsMuted(!isMuted)}
            >
              {isMuted ? <FaVolumeMute /> : <FaVolumeUp />}
            </button>
            
            <div 
              style={{
                width: '80px',
                height: '4px',
                backgroundColor: '#535353',
                borderRadius: '2px',
                position: 'relative',
                cursor: 'pointer'
              }}
              onClick={(e) => {
                const volumeBar = e.currentTarget;
                const rect = volumeBar.getBoundingClientRect();
                const clickPosition = e.clientX - rect.left;
                const percentage = clickPosition / rect.width;
                setVolume(percentage);
                setIsMuted(false);
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  height: '100%',
                  width: `${isMuted ? 0 : volume * 100}%`,
                  backgroundColor: 'white',
                  borderRadius: '2px'
                }}
              ></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChordoraLayout;