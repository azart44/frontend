import React, { useState } from 'react';
import { 
  View, 
  Heading, 
  Text, 
  Button, 
  Flex, 
  Loader, 
  Card,
  SelectField,
  TextField,
  SearchField
} from '@aws-amplify/ui-react';
import { useSearchTracks } from '../../hooks/useTracks';
import { useAudioContext } from '../../contexts/AudioContext';
import { FaPlus, FaFilter } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import TrackCard from './TrackCard';
import { MUSIC_GENRES } from '../../constants/profileData';

/**
 * Page pour explorer et filtrer les pistes
 * Utile pour ajouter des pistes aux playlists
 */
const TrackListPage: React.FC = () => {
  const navigate = useNavigate();
  const { playTrack } = useAudioContext();
  
  // États pour les filtres
  const [genre, setGenre] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [bpmMin, setBpmMin] = useState<string>('');
  const [bpmMax, setBpmMax] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);
  
  // Créer les paramètres de recherche
  const searchParams: Record<string, string | number> = {};
  
  if (genre) searchParams.genre = genre;
  if (searchTerm) searchParams.query = searchTerm;
  if (bpmMin) searchParams.bpmMin = parseInt(bpmMin);
  if (bpmMax) searchParams.bpmMax = parseInt(bpmMax);
  
  // Utiliser le hook de recherche
  const { 
    data, 
    isLoading, 
    error 
  } = useSearchTracks(Object.keys(searchParams).length > 0 ? searchParams : { recent: 'true' });
  
  // Appliquer les filtres
  const handleApplyFilters = () => {
    // Les filtres sont déjà appliqués via les états et le hook useSearchTracks
    setShowFilters(false);
  };
  
  // Réinitialiser les filtres
  const handleResetFilters = () => {
    setGenre('');
    setBpmMin('');
    setBpmMax('');
    setSearchTerm('');
  };
  
  // Gérer la lecture d'une piste
  const handlePlayTrack = (track: any) => {
    playTrack(track);
  };
  
  return (
    <View padding="2rem">
      <Flex 
        justifyContent="space-between" 
        alignItems="center"
        marginBottom="1.5rem"
      >
        <Heading level={2}>Explorer les pistes</Heading>
        
        <Button 
          onClick={() => navigate('/add-track')} 
          variation="primary"
        >
          <FaPlus style={{ marginRight: '0.5rem' }} />
          Ajouter une piste
        </Button>
      </Flex>
      
      {/* Barre de recherche */}
      <Flex 
        gap="1rem" 
        marginBottom="1.5rem"
        direction={{ base: 'column', medium: 'row' }}
        alignItems="flex-start"
      >
        <SearchField
          label="Recherche"
          labelHidden
          placeholder="Rechercher des pistes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          flex="1"
          size="large"
        />
        
        <Button 
          onClick={() => setShowFilters(!showFilters)}
          variation="menu"
        >
          <FaFilter style={{ marginRight: '0.5rem' }} />
          Filtres
        </Button>
      </Flex>
      
      {/* Panneau de filtres */}
      {showFilters && (
        <Card padding="1.5rem" marginBottom="1.5rem">
          <Flex 
            direction={{ base: 'column', medium: 'row' }}
            gap="1rem"
          >
            <SelectField
              label="Genre"
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
              flex="1"
            >
              <option value="">Tous les genres</option>
              {MUSIC_GENRES.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </SelectField>
            
            <Flex direction="column" flex="1">
              <Text>BPM</Text>
              <Flex gap="0.5rem" alignItems="center">
                <TextField
                  label="Min BPM"
                  labelHidden
                  placeholder="Min"
                  value={bpmMin}
                  onChange={(e) => setBpmMin(e.target.value)}
                  flex="1"
                  type="number"
                />
                <Text>-</Text>
                <TextField
                  label="Max BPM"
                  labelHidden
                  placeholder="Max"
                  value={bpmMax}
                  onChange={(e) => setBpmMax(e.target.value)}
                  flex="1"
                  type="number"
                />
              </Flex>
            </Flex>
          </Flex>
          
          <Flex gap="1rem" marginTop="1.5rem" justifyContent="flex-end">
            <Button 
              onClick={handleResetFilters}
              variation="link"
            >
              Réinitialiser
            </Button>
            <Button 
              onClick={handleApplyFilters}
              variation="primary"
            >
              Appliquer
            </Button>
          </Flex>
        </Card>
      )}
      
      {/* Contenu des pistes */}
      {isLoading ? (
        <Flex justifyContent="center" padding="2rem">
          <Loader size="large" />
        </Flex>
      ) : error ? (
        <Text color="red">
          Une erreur est survenue lors du chargement des pistes.
        </Text>
      ) : data?.tracks && data.tracks.length > 0 ? (
        <Flex direction="column" gap="1rem">
          <Text marginBottom="1rem">{data.count} pistes trouvées</Text>
          
          {data.tracks.map((track) => (
            <TrackCard
              key={track.track_id}
              track={track}
              onPlay={() => handlePlayTrack(track)}
              showLikeButton={true}
            />
          ))}
        </Flex>
      ) : (
        <Card padding="2rem" textAlign="center">
          <Text>Aucune piste ne correspond à vos critères.</Text>
          <Button 
            onClick={handleResetFilters}
            variation="primary"
            marginTop="1rem"
          >
            Réinitialiser les filtres
          </Button>
        </Card>
      )}
    </View>
  );
};

export default TrackListPage;