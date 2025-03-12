import React, { useState, useEffect } from 'react';
import { 
  Heading, 
  Text, 
  Button, 
  Image,
  View,
  Card
} from '@aws-amplify/ui-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useAudioContext } from '../contexts/AudioContext';
import { FaPlay, FaPause, FaHeart, FaRandom } from 'react-icons/fa';
import { Track } from '../types/TrackTypes';
import TrackCard from './track/TrackCard';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { playTrack, currentTrack, isPlaying } = useAudioContext();
  const [trendingTracks, setTrendingTracks] = useState<Track[]>([]);
  const [recentlyPlayed, setRecentlyPlayed] = useState<Track[]>([]);
  const [topArtists, setTopArtists] = useState<any[]>([]);
  
  useEffect(() => {
    // Simuler des données de l'API
    const loadData = async () => {
      // Données fictives pour la démo
      const mockTracks: Track[] = [
        {
          track_id: '1',
          title: 'Summer Vibes',
          artist: 'Keiji',
          user_id: '14a874d8-a001-7079-ae6e-45fab155068c',
          genre: 'Trap',
          bpm: 140,
          duration: 183,
          likes: 124,
          downloads: 45,
          cover_image: '/default-cover.jpg'
        },
        {
          track_id: '2',
          title: 'Night Drive',
          artist: 'Project Blvck',
          user_id: 'user2',
          genre: 'Drill',
          bpm: 165,
          duration: 201,
          likes: 87,
          downloads: 32,
          cover_image: 'https://fiverr-res.cloudinary.com/images/q_auto,f_auto/gigs/327644549/original/6f53e0dfe49add0ed8c29b4b665603d251e1acca/create-a-music-rap-cover-art-album-cover-1185.png'
        },
        {
          track_id: '3',
          title: 'Cloud Nine',
          artist: 'SeaSky',
          user_id: 'user3',
          genre: 'R&B',
          bpm: 95,
          duration: 175,
          likes: 156,
          downloads: 67,
          cover_image: 'https://res.cloudinary.com/zenbusiness/image/upload/v1670445040/logaster/logaster-2021-02-music-album-h.jpg'
        },
        {
          track_id: '4',
          title: 'Electric Dreams',
          artist: 'Neon Wave',
          user_id: 'user4',
          genre: 'Synthwave',
          bpm: 120,
          duration: 195,
          likes: 203,
          downloads: 89,
          cover_image: 'https://mir-s3-cdn-cf.behance.net/project_modules/1400/c5186e38292485.57697f49c9e71.jpg'
        },
        {
          track_id: '5',
          title: 'Heavy Hearts',
          artist: 'Soul Searcher',
          user_id: 'user5',
          genre: 'Boom Bap',
          bpm: 88,
          duration: 220,
          likes: 178,
          downloads: 72,
          cover_image: 'https://static.vecteezy.com/system/resources/thumbnails/026/475/473/small_2x/abstract-bright-geometric-background-blue-orange-pattern-music-album-cover-design-perfume-magazine-cover-design-ai-generated-photo.jpg'
        },
        {
          track_id: '6',
          title: 'City Lights',
          artist: 'Urban Poet',
          user_id: 'user6',
          genre: 'Trap',
          bpm: 130,
          duration: 190,
          likes: 134,
          downloads: 55,
          cover_image: 'https://fiverr-res.cloudinary.com/images/q_auto,f_auto/gigs/327644549/original/6f53e0dfe49add0ed8c29b4b665603d251e1acca/create-a-music-rap-cover-art-album-cover-1185.png'
        }
      ];
      
      const mockArtists = [
        {
          userId: '14a874d8-a001-7079-ae6e-45fab155068c',
          username: 'Keiji',
          userType: 'producer',
          profileImageUrl: 'https://imgv3.fotor.com/images/blog-richtext-image/musci-album-of-Blue-Neighbourhood-from-Troye-Sivan.webp'
        },
        {
          userId: 'user2',
          username: 'Project Blvck',
          userType: 'beatmaker',
          profileImageUrl: 'https://abduzeedo.com/sites/default/files/styles/square_1x1/public/originals/0ec5c569226647.5b79b483096c1.jpg?itok=e3ASF2Y-'
        },
        {
          userId: 'user3',
          username: 'SeaSky',
          userType: 'artist',
          profileImageUrl: 'https://static.vecteezy.com/system/resources/previews/013/682/532/non_2x/retro-wave-music-album-cover-template-with-girl-in-headphones-retro-futuristic-background-vector.jpg'
        },
        {
          userId: 'user4',
          username: 'Neon Wave',
          userType: 'producer',
          profileImageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ3kDfO9HDaJGZlyWnfCgv8khbrnTSk3G_aaw&s'
        },
        {
          userId: 'user5',
          username: 'Soul Searcher',
          userType: 'artist',
          profileImageUrl: 'https://d1csarkz8obe9u.cloudfront.net/posterpreviews/cool-music-album-cover-design-template-3324b2b5c69bb9a3cfaed14c71f24ca8_screen.jpg?ts=1572456482'
        }
      ];
      
      setTrendingTracks(mockTracks);
      setRecentlyPlayed(mockTracks.slice().reverse().slice(0, 4));
      setTopArtists(mockArtists);
    };
    
    loadData();
  }, []);
  
  // Gérer la lecture d'une piste
  const handlePlayTrack = (track: Track) => {
    playTrack(track);
  };
  
  return (
    <View>
      {/* Bannière d'accueil */}
      <div className="home-banner">
        <div className="home-banner-content">
          <span className="sponsored-badge">SPONSORISÉ</span>
          <h1 className="home-banner-title">
            Entrez Dans Le Monde Où La Musique Rencontre La Magie
          </h1>
          <p className="home-banner-text">
            Explorez une vaste bibliothèque de beats couvrant tous les genres et toutes les époques.
          </p>
          <Button 
            variation="primary"
            style={{ 
              backgroundColor: 'white', 
              color: 'black', 
              borderRadius: '25px',
              padding: '0.75rem 2rem',
              fontWeight: 600
            }}
          >
            Découvrir maintenant
          </Button>
        </div>
      </div>
      
      {/* Section "Joués récemment" */}
      <section style={{ marginBottom: '2rem' }}>
        <div className="section-title">
          <h2>Joués récemment</h2>
          <Button 
            variation="link" 
            padding="0"
            onClick={() => navigate('/tracks')}
            style={{ color: 'var(--chordora-text-secondary)', textDecoration: 'none' }}
          >
            Voir tous
          </Button>
        </div>
        
        <div className="playlist-grid">
          {recentlyPlayed.map(track => (
            <div key={track.track_id} className="playlist-card">
              <div style={{ position: 'relative' }}>
                <Image
                  src={track.cover_image || '/default-cover.jpg'}
                  alt={track.title}
                  className="playlist-card-image"
                />
                <div 
                  style={{
                    position: 'absolute',
                    bottom: '8px',
                    right: '8px',
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--chordora-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    opacity: 0,
                    transition: 'opacity 0.2s ease',
                    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3)'
                  }}
                  className="play-button-overlay"
                  onClick={() => handlePlayTrack(track)}
                  onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                >
                  {currentTrack?.track_id === track.track_id && isPlaying ? (
                    <FaPause color="white" />
                  ) : (
                    <FaPlay color="white" />
                  )}
                </div>
              </div>
              <h3 className="playlist-card-title">{track.title}</h3>
              <p className="playlist-card-subtitle">
                {track.artist} • {track.genre}
              </p>
            </div>
          ))}
        </div>
      </section>
      
      {/* Section "Billboard cette semaine" */}
      <section style={{ marginBottom: '2rem' }}>
        <div className="section-title">
          <h2>Cette semaine, le top billboard #25</h2>
          <Button 
            variation="link" 
            padding="0"
            onClick={() => navigate('/tracks')}
            style={{ color: 'var(--chordora-text-secondary)', textDecoration: 'none' }}
          >
            Voir tous
          </Button>
        </div>
        
        <Card padding="0" backgroundColor="var(--chordora-card-bg)" borderRadius="8px">
          {trendingTracks.slice(0, 5).map((track, index) => (
            <React.Fragment key={track.track_id}>
              <TrackCard
                track={{...track, position: index + 1}}
                onPlay={() => handlePlayTrack(track)}
                showLikeButton={true}
                showFavoriteButton={true}
                displayStyle="row"
              />
              {/* Ajouter un séparateur entre les pistes sauf pour la dernière */}
              {index < trendingTracks.slice(0, 5).length - 1 && (
                <div style={{ 
                  height: '1px', 
                  backgroundColor: 'var(--chordora-divider)',
                  margin: '0 1rem'
                }} />
              )}
            </React.Fragment>
          ))}
        </Card>
      </section>
      
      {/* Section "Artistes populaires" */}
      <section style={{ marginBottom: '2rem' }}>
        <div className="section-title">
          <h2>Artistes populaires</h2>
          <Button 
            variation="link" 
            padding="0"
            onClick={() => navigate('/users')}
            style={{ color: 'var(--chordora-text-secondary)', textDecoration: 'none' }}
          >
            Voir tous
          </Button>
        </div>
        
        <div className="playlist-grid">
          {topArtists.map(artist => (
            <div 
              key={artist.userId} 
              className="playlist-card"
              onClick={() => navigate(`/profile/${artist.userId}`)}
            >
              <div style={{ position: 'relative' }}>
                <Image
                  src={artist.profileImageUrl || '/default-profile.jpg'}
                  alt={artist.username}
                  className="playlist-card-image"
                  style={{ borderRadius: '50%' }}
                />
              </div>
              <h3 className="playlist-card-title" style={{ textAlign: 'center' }}>
                {artist.username}
              </h3>
              <p className="playlist-card-subtitle" style={{ textAlign: 'center' }}>
                {artist.userType}
              </p>
            </div>
          ))}
        </div>
      </section>
      
      {/* Call to action pour les utilisateurs non connectés */}
      {!isAuthenticated && (
        <section style={{ 
          backgroundColor: 'var(--chordora-card-bg)',
          borderRadius: '8px',
          padding: '2rem',
          marginTop: '3rem',
          marginBottom: '2rem',
          textAlign: 'center'
        }}>
          <Heading level={3} style={{ marginBottom: '1rem' }}>
            Rejoignez Chordora aujourd'hui
          </Heading>
          <Text style={{ marginBottom: '1.5rem', maxWidth: '600px', margin: '0 auto' }}>
            Créez votre compte pour accéder à plus de fonctionnalités, collaborer avec d'autres artistes et partager vos créations musicales.
          </Text>
          <Button 
            onClick={() => navigate('/auth')}
            variation="primary"
            style={{ 
              backgroundColor: 'var(--chordora-primary)',
              borderRadius: '25px',
              padding: '0.75rem 2rem'
            }}
          >
            S'inscrire gratuitement
          </Button>
        </section>
      )}
    </View>
  );
};

export default HomePage;