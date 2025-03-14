// src/components/beatswipe/BeatSwipeCard.tsx

import React, { useState, useRef, useEffect } from 'react';
import { 
  Card, 
  Image, 
  Text, 
  Flex, 
  Badge, 
  Button 
} from '@aws-amplify/ui-react';
import { 
  FaPlay, 
  FaPause, 
  FaHeart, 
  FaStar, 
  FaTimes 
} from 'react-icons/fa';
import { Track } from '../../types/TrackTypes';
import { useAudioContext } from '../../contexts/AudioContext';
import './BeatSwipeCard.css';

interface BeatSwipeCardProps {
  track: Track;
  onSwipeRight: () => void;
  onSwipeLeft: () => void;
  onSwipeDown: () => void;
  isActionLoading?: boolean;
}

const BeatSwipeCard: React.FC<BeatSwipeCardProps> = ({ 
  track, 
  onSwipeRight, 
  onSwipeLeft, 
  onSwipeDown,
  isActionLoading = false
}) => {
  const { playTrack, currentTrack, isPlaying, togglePlay } = useAudioContext();
  const [isDragging, setIsDragging] = useState(false);
  const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 });
  const [exitDirection, setExitDirection] = useState<'left' | 'right' | 'down' | null>(null);
  const [imageError, setImageError] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const dragStartRef = useRef<{ x: number, y: number } | null>(null);
  
  // Gestion du lecteur audio
  const isCurrentlyPlaying = currentTrack?.track_id === track.track_id && isPlaying;
  
  const handlePlayPause = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (currentTrack?.track_id === track.track_id) {
      togglePlay();
    } else {
      playTrack(track);
    }
  };
  
  // Formatage du temps
  const formatTime = (seconds?: number): string => {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };
  
  // Détermine l'URL de l'image de couverture à utiliser
  const getCoverImageUrl = (): string => {
    // Si une erreur s'est produite lors du chargement de l'image, utiliser l'image par défaut
    if (imageError) {
      return '/default-cover.jpg';
    }
    
    // Vérifier les différentes possibilités d'URL d'image dans un ordre de priorité clair
    if (track.cover_image && 
       (track.cover_image.startsWith('http://') || track.cover_image.startsWith('https://'))) {
      return track.cover_image;
    } else if (track.coverImageUrl && 
              (track.coverImageUrl.startsWith('http://') || track.coverImageUrl.startsWith('https://'))) {
      return track.coverImageUrl;
    } else {
      // Image par défaut si aucune URL n'est disponible ou si les URL ne sont pas absolues
      return '/default-cover.jpg';
    }
  };
  
  // Gestion du swipe (drag & drop)
  const handleMouseDown = (e: React.MouseEvent) => {
    if (isActionLoading) return;
    
    // Mémoriser le point de départ du drag
    if (cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect();
      dragStartRef.current = { 
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
      
      setIsDragging(true);
      setDragPosition({ x: 0, y: 0 });
      setExitDirection(null);
      
      // Empêcher la propagation de l'événement mousedown
      e.stopPropagation();
    }
  };
  
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || isActionLoading || !dragStartRef.current) return;
    
    // Calculer le mouvement depuis le début du drag
    if (cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect();
      const moveX = e.clientX - rect.left - dragStartRef.current.x;
      const moveY = e.clientY - rect.top - dragStartRef.current.y;
      
      setDragPosition({ x: moveX, y: moveY });
      
      // Empêcher la propagation de l'événement mousemove
      e.stopPropagation();
      e.preventDefault();
    }
  };
  
  const handleMouseUp = (e: React.MouseEvent) => {
    if (!isDragging || isActionLoading) return;
    
    // Déterminer l'action en fonction de la direction du swipe
    const threshold = 100; // Seuil de déplacement pour déclencher une action
    
    if (dragPosition.x > threshold) {
      // Swipe vers la droite (like)
      setExitDirection('right');
      onSwipeRight();
    } else if (dragPosition.x < -threshold) {
      // Swipe vers la gauche (skip)
      setExitDirection('left');
      onSwipeLeft();
    } else if (dragPosition.y > threshold) {
      // Swipe vers le bas (ajouter aux favoris)
      setExitDirection('down');
      onSwipeDown();
    } else {
      // Retour à la position initiale si pas de swipe significatif
      setDragPosition({ x: 0, y: 0 });
    }
    
    setIsDragging(false);
    dragStartRef.current = null;
    
    // Empêcher la propagation de l'événement mouseup
    e.stopPropagation();
  };
  
  const handleMouseLeave = (e: React.MouseEvent) => {
    if (isDragging) {
      setIsDragging(false);
      setDragPosition({ x: 0, y: 0 });
      dragStartRef.current = null;
      
      // Empêcher la propagation de l'événement mouseleave
      e.stopPropagation();
    }
  };
  
  // Gérer le clic sur les boutons d'action
  const handleActionButtonClick = (action: () => void, e: React.MouseEvent) => {
    e.stopPropagation();
    action();
  };
  
  // Gérer les erreurs de chargement d'image
  const handleImageError = () => {
    console.error(`Erreur de chargement de l'image pour la piste ${track.track_id}`);
    setImageError(true);
  };
  
  // Clean up event listeners on unmount
  useEffect(() => {
    return () => {
      setIsDragging(false);
      dragStartRef.current = null;
    };
  }, []);
  
  // Style de la carte en fonction du drag
  const getCardStyle = () => {
    // Calculer la rotation en fonction de la position horizontale
    const rotation = dragPosition.x / 20; // Diviser par 20 pour un effet plus subtil
    
    // Calculer l'opacité en fonction de la distance
    const distance = Math.sqrt(dragPosition.x ** 2 + dragPosition.y ** 2);
    const maxDistance = 200;
    const opacity = 1 - Math.min(distance / maxDistance, 0.6); // Max 60% de transparence
    
    // Calculer la transformation CSS
    return {
      transform: `translate(${dragPosition.x}px, ${dragPosition.y}px) rotate(${rotation}deg)`,
      opacity: opacity,
      cursor: isDragging ? 'grabbing' : 'grab',
      boxShadow: `0 ${5 + Math.abs(dragPosition.y / 10)}px ${10 + Math.abs(dragPosition.x / 5)}px rgba(0,0,0,0.2)`,
      transition: isDragging ? 'none' : 'transform 0.5s ease, opacity 0.5s ease'
    };
  };
  
  // Style pour indiquer le résultat potentiel du swipe actuel
  const getActionIndicatorStyle = () => {
    if (dragPosition.x > 50) {
      // Swipe droit (like)
      return { right: 20, opacity: Math.min(dragPosition.x / 100, 1), color: '#4CAF50' };
    } else if (dragPosition.x < -50) {
      // Swipe gauche (skip)
      return { left: 20, opacity: Math.min(-dragPosition.x / 100, 1), color: '#F44336' };
    } else if (dragPosition.y > 50) {
      // Swipe bas (favoris)
      return { bottom: 20, opacity: Math.min(dragPosition.y / 100, 1), color: '#FFD700' };
    }
    
    return { opacity: 0 };
  };
  
  // Pour le débogage de l'image
  useEffect(() => {
    console.log(`BeatSwipeCard - URLs d'image disponibles pour ${track.track_id}:`, {
      cover_image: track.cover_image,
      coverImageUrl: track.coverImageUrl,
      cover_image_path: track.cover_image_path
    });
  }, [track]);
  
  return (
    <div 
      className={`beat-swipe-card-container ${exitDirection ? `exit-${exitDirection}` : ''}`}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      ref={cardRef}
      style={getCardStyle()}
    >
      <Card className="beat-swipe-card">
        {/* Image de couverture avec overlay semi-transparent */}
        <div className="beat-swipe-card-image-container">
          <Image
            src={getCoverImageUrl()}
            alt={track.title}
            className="beat-swipe-card-image"
            onError={handleImageError}
          />
          <div className="beat-swipe-card-image-overlay"></div>
          
          {/* Bouton play/pause */}
          <Button
            className="play-button"
            onClick={handlePlayPause}
            variation="primary"
          >
            {isCurrentlyPlaying ? <FaPause /> : <FaPlay />}
          </Button>
        </div>
        
        {/* Informations sur la piste */}
        <div className="beat-swipe-card-content">
          <Text className="beat-swipe-card-title">{track.title}</Text>
          <Text className="beat-swipe-card-artist">{track.artist || "Artiste"}</Text>
          
          <Flex gap="0.5rem" wrap="wrap" marginTop="0.5rem">
            <Badge variation="info">{track.genre}</Badge>
            {track.bpm && <Badge variation="warning">{track.bpm} BPM</Badge>}
            {track.mood && <Badge variation="success">{track.mood}</Badge>}
          </Flex>
          
          {track.duration && (
            <Text className="beat-swipe-card-duration">
              {formatTime(track.duration)}
            </Text>
          )}
        </div>
        
        {/* Indicateurs d'action */}
        <div className="beat-swipe-action-indicators">
          <div 
            className="action-like"
            style={{ opacity: dragPosition.x > 50 ? Math.min(dragPosition.x / 100, 1) : 0 }}
          >
            <FaHeart size={50} />
          </div>
          
          <div 
            className="action-skip"
            style={{ opacity: dragPosition.x < -50 ? Math.min(-dragPosition.x / 100, 1) : 0 }}
          >
            <FaTimes size={50} />
          </div>
          
          <div 
            className="action-favorite"
            style={{ opacity: dragPosition.y > 50 ? Math.min(dragPosition.y / 100, 1) : 0 }}
          >
            <FaStar size={50} />
          </div>
        </div>
        
        {/* Boutons d'action alternatifs (pour utilisateurs qui préfèrent les boutons au swipe) */}
        <div className="beat-swipe-buttons">
          <Button
            onClick={(e) => handleActionButtonClick(onSwipeLeft, e)}
            variation="primary"
            isDisabled={isActionLoading}
            className="beat-swipe-button skip-button"
          >
            <FaTimes />
          </Button>
          
          <Button
            onClick={(e) => handleActionButtonClick(onSwipeDown, e)}
            variation="primary"
            isDisabled={isActionLoading}
            className="beat-swipe-button favorite-button"
          >
            <FaStar />
          </Button>
          
          <Button
            onClick={(e) => handleActionButtonClick(onSwipeRight, e)}
            variation="primary"
            isDisabled={isActionLoading}
            className="beat-swipe-button like-button"
          >
            <FaHeart />
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default BeatSwipeCard;