import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  View, 
  Flex, 
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
  FaPlay, 
  FaPause, 
  FaStepForward, 
  FaStepBackward, 
  FaVolumeUp,
  FaSignOutAlt
} from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';
import { useAudioPlayer } from '../../hooks/useAudioPlayer';
import { Track } from '../../types/TrackTypes';

interface ChordoraLayoutProps {
  children: React.ReactNode;
}

const ChordoraLayout: React.FC<ChordoraLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const { signOut } = useAuthenticator(context => [context.signOut]);
  const [currentTrack] = useState<Track | null>(null);
  
  // Utiliser le hook useAudioPlayer pour contrôler le player audio
  const { 
    isPlaying, 
    currentTime, 
    duration, 
    volume,
    togglePlay, 
    seek, 
    changeVolume 
  } = useAudioPlayer({ 
    onEnded: () => console.log('Lecture terminée') 
  });

  // Déterminer si le menu est actif
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  // Formater le temps (secondes -> MM:SS)
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Navigation vers un chemin
  const navigateTo = (path: string) => {
    navigate(path);
  };

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
    <Flex className="chordora-layout">
      {/* Menu latéral sticky */}
      <View 
        className="sidebar"
        backgroundColor="#1e2024"
        color="white"
        width="240px"
        height="100vh"
        position="fixed"
        left="0"
        top="0"
        padding="1rem"
        style={{ overflowY: 'auto' }}
      >
        {/* Logo */}
        <Flex justifyContent="center" marginBottom="2rem">
          <Image
            src="/logo.svg"
            alt="Chordora Logo"
            height="60px"
            onClick={() => navigateTo('/')}
            style={{ cursor: 'pointer' }}
          />
        </Flex>

        {/* Menu principal */}
        <Flex direction="column" gap="0.5rem">
          <Text color="#87e54c" fontWeight="bold" marginBottom="0.5rem">MAIN</Text>
          
          <Button
            onClick={() => navigateTo('/')}
            backgroundColor={isActive('/') ? 'rgba(135, 229, 76, 0.2)' : 'transparent'}
            color={isActive('/') ? '#87e54c' : 'white'}
            justifyContent="flex-start"
            fontWeight={isActive('/') ? 'bold' : 'normal'}
            style={{ borderRadius: '8px', padding: '0.75rem 1rem' }}
          >
            <FaHome style={{ marginRight: '12px' }} />
            Accueil
          </Button>
          
          <Button
            onClick={() => navigateTo('/users')}
            backgroundColor={isActive('/users') ? 'rgba(135, 229, 76, 0.2)' : 'transparent'}
            color={isActive('/users') ? '#87e54c' : 'white'}
            justifyContent="flex-start"
            fontWeight={isActive('/users') ? 'bold' : 'normal'}
            style={{ borderRadius: '8px', padding: '0.75rem 1rem' }}
          >
            <FaSearch style={{ marginRight: '12px' }} />
            Explorer
          </Button>
          
          {isAuthenticated && (
            <>
              <Text color="#87e54c" fontWeight="bold" marginTop="1.5rem" marginBottom="0.5rem">LIBRARY</Text>
              
              <Button
                onClick={() => navigateTo('/profile')}
                backgroundColor={isActive('/profile') ? 'rgba(135, 229, 76, 0.2)' : 'transparent'}
                color={isActive('/profile') ? '#87e54c' : 'white'}
                justifyContent="flex-start"
                fontWeight={isActive('/profile') ? 'bold' : 'normal'}
                style={{ borderRadius: '8px', padding: '0.75rem 1rem' }}
              >
                <FaUser style={{ marginRight: '12px' }} />
                Mon Profil
              </Button>
              
              <Button
                onClick={() => navigateTo('/add-track')}
                backgroundColor={isActive('/add-track') ? 'rgba(135, 229, 76, 0.2)' : 'transparent'}
                color={isActive('/add-track') ? '#87e54c' : 'white'}
                justifyContent="flex-start"
                fontWeight={isActive('/add-track') ? 'bold' : 'normal'}
                style={{ borderRadius: '8px', padding: '0.75rem 1rem' }}
              >
                <FaMusic style={{ marginRight: '12px' }} />
                Ajouter un son
              </Button>
              
              <Button
                onClick={() => navigateTo('/favorites')}
                backgroundColor={isActive('/favorites') ? 'rgba(135, 229, 76, 0.2)' : 'transparent'}
                color={isActive('/favorites') ? '#87e54c' : 'white'}
                justifyContent="flex-start"
                fontWeight={isActive('/favorites') ? 'bold' : 'normal'}
                style={{ borderRadius: '8px', padding: '0.75rem 1rem' }}
              >
                <FaHeart style={{ marginRight: '12px' }} />
                Favoris
              </Button>
              
              <View marginTop="auto" paddingTop="2rem">
                <Button
                  onClick={handleLogout}
                  backgroundColor="transparent"
                  color="white"
                  justifyContent="flex-start"
                  style={{ borderRadius: '8px', padding: '0.75rem 1rem' }}
                >
                  <FaSignOutAlt style={{ marginRight: '12px' }} />
                  Déconnexion
                </Button>
              </View>
            </>
          )}
          
          {!isAuthenticated && (
            <Button
              onClick={() => navigateTo('/auth')}
              backgroundColor="#3e1dfc"
              color="white"
              style={{ borderRadius: '8px', padding: '0.75rem 1rem', marginTop: '2rem' }}
            >
              Connexion / Inscription
            </Button>
          )}
        </Flex>
      </View>

      {/* Contenu principal */}
      <View 
        className="main-content"
        backgroundColor="#1e2024"
        color="white"
        marginLeft="240px" 
        width="calc(100% - 240px)"
        minHeight="100vh"
        paddingBottom="80px" // Espace pour le player
      >
        {children}
      </View>

      {/* Player audio fixé en bas */}
      {currentTrack && (
        <View
          className="audio-player"
          position="fixed"
          bottom="0"
          left="0"
          right="0"
          height="80px"
          backgroundColor="#121416"
          padding="0 1rem"
          style={{ 
            borderTop: "1px solid #2a2d36",
            zIndex: 1000 
          }}
        >
          <Flex height="100%" alignItems="center" justifyContent="space-between">
            {/* Informations sur la piste en cours */}
            <Flex alignItems="center" flex="1" maxWidth="30%">
              <Image
                src={currentTrack.cover_image || "/default-cover.jpg"}
                alt={currentTrack.title}
                width="50px"
                height="50px"
                style={{ objectFit: 'cover', borderRadius: '4px' }}
                marginRight="1rem"
              />
              <Flex direction="column">
                <Text fontSize="0.9rem" fontWeight="bold" isTruncated>{currentTrack.title}</Text>
                <Text fontSize="0.8rem" color="#87e54c" isTruncated>{currentTrack.genre}</Text>
              </Flex>
            </Flex>

            {/* Contrôles de lecture */}
            <Flex direction="column" flex="2" alignItems="center">
              <Flex alignItems="center" gap="1rem">
                <Button
                  backgroundColor="transparent"
                  color="white"
                  padding="0"
                  onClick={() => console.log('Previous track')}
                >
                  <FaStepBackward size={14} />
                </Button>
                
                <Button
                  backgroundColor="#3e1dfc"
                  color="white"
                  size="small"
                  borderRadius="50%"
                  width="36px"
                  height="36px"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  onClick={togglePlay}
                >
                  {isPlaying ? <FaPause size={14} /> : <FaPlay size={14} />}
                </Button>
                
                <Button
                  backgroundColor="transparent"
                  color="white"
                  padding="0"
                  onClick={() => console.log('Next track')}
                >
                  <FaStepForward size={14} />
                </Button>
              </Flex>
              
              <Flex alignItems="center" width="100%" gap="0.5rem">
                <Text fontSize="0.7rem" color="#808080">{formatTime(currentTime)}</Text>
                <input
                  type="range"
                  min="0"
                  max={duration || 1}
                  value={currentTime}
                  onChange={(e) => seek(parseFloat(e.target.value))}
                  style={{ 
                    flex: 1, 
                    height: '4px',
                    accentColor: '#87e54c', 
                    background: 'linear-gradient(to right, #87e54c 0%, #87e54c ' + (currentTime / duration * 100) + '%, #333 ' + (currentTime / duration * 100) + '%, #333 100%)'
                  }}
                />
                <Text fontSize="0.7rem" color="#808080">{formatTime(duration)}</Text>
              </Flex>
            </Flex>

            {/* Contrôle du volume */}
            <Flex alignItems="center" gap="0.5rem" flex="1" maxWidth="20%" justifyContent="flex-end">
              <FaVolumeUp color="#808080" />
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={(e) => changeVolume(parseFloat(e.target.value))}
                style={{ 
                  width: '80px', 
                  accentColor: '#3e1dfc',
                  height: '4px' 
                }}
              />
            </Flex>
          </Flex>
        </View>
      )}
    </Flex>
  );
};

export default ChordoraLayout;