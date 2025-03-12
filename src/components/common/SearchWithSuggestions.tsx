import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Button, 
  View, 
  SearchField, 
  Text,
  Flex,
  Image,
  Loader 
} from '@aws-amplify/ui-react';
import { searchProfiles } from '../../api/profile';
import { UserSuggestion } from '../../types/types';

// Fonction simple de debounce
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

const SearchWithSuggestions: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState<UserSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const searchRef = useRef<HTMLDivElement>(null);
  
  // Debounce search term
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  
  // Effectuer la recherche
  useEffect(() => {
    const performSearch = async () => {
      if (debouncedSearchTerm.trim().length >= 2) {
        try {
          setIsLoading(true);
          setError(null);
          const response = await searchProfiles(debouncedSearchTerm);
          if (response && response.data) {
            // Filtrer les doublons
            const uniqueSuggestions = response.data.filter(
              (suggestion: any, index: number, self: any[]) =>
                index === self.findIndex((t) => t.userId === suggestion.userId)
            );
            setSuggestions(uniqueSuggestions);
            setShowSuggestions(true);
          } else {
            setSuggestions([]);
          }
        } catch (error) {
          console.error('Erreur recherche:', error);
          setError('La recherche a échoué. Veuillez réessayer.');
          setSuggestions([]);
        } finally {
          setIsLoading(false);
        }
      } else {
        setSuggestions([]);
      }
    };

    performSearch();
  }, [debouncedSearchTerm]);
  
  // Clic en dehors pour fermer les suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Gérer les changements de recherche
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (value.trim()) {
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  }, []);
  
  // Cliquer sur une suggestion
  const handleSuggestionClick = useCallback((userId: string) => {
    navigate(`/profile/${userId}`);
    setShowSuggestions(false);
    setSearchTerm('');
  }, [navigate]);
  
  // Effacer la recherche
  const handleClearSearch = useCallback(() => {
    setSearchTerm('');
    setSuggestions([]);
    setShowSuggestions(false);
  }, []);
  
  return (
    <View position="relative" ref={searchRef} width={{ base: '100%', medium: '300px' }}>
      <SearchField
        label="Recherche"
        labelHidden
        placeholder="Rechercher des artistes..."
        width="100%"
        value={searchTerm}
        onChange={handleSearchChange}
        onFocus={() => setShowSuggestions(!!searchTerm.trim())}
        size="large"
        hasSearchButton={false}
        hasSearchIcon={true}
        innerEndComponent={
          searchTerm && (
            <Button
              onClick={handleClearSearch}
              variation="link"
              ariaLabel="Clear search"
              style={{
                position: 'absolute',
                right: '8px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
              }}
            >
              ✕
            </Button>
          )
        }
      />
      
      {showSuggestions && (
        <View
          position="absolute"
          top="100%"
          left="0"
          right="0"
          backgroundColor="white"
          borderRadius="medium"
          boxShadow="medium"
          maxHeight="300px"
          overflow="auto"
          style={{ zIndex: 10 }}
        >
          {isLoading ? (
            <Flex padding="1rem" justifyContent="center">
              <Loader size="small" />
            </Flex>
          ) : error ? (
            <Text padding="1rem" color="red" textAlign="center">
              {error}
            </Text>
          ) : suggestions.length > 0 ? (
            suggestions.map((suggestion) => (
              <Flex
                key={suggestion.userId}
                padding="0.5rem"
                alignItems="center"
                gap="0.5rem"
                onClick={() => handleSuggestionClick(suggestion.userId)}
                style={{ 
                  cursor: 'pointer',
                  backgroundColor: "transparent",
                  transition: "background-color 0.2s ease-in-out" 
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.05)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <Image
                  src={suggestion.profileImageUrl || 'https://via.placeholder.com/40'}
                  alt={suggestion.name}
                  width="40px"
                  height="40px"
                  borderRadius="50%"
                />
                <Flex direction="column">
                  <Text fontWeight="bold">{suggestion.name || suggestion.userId}</Text>
                  {suggestion.userType && (
                    <Text fontSize="small" color="gray">
                      {suggestion.userType}
                    </Text>
                  )}
                </Flex>
              </Flex>
            ))
          ) : searchTerm.trim().length >= 2 ? (
            <Text padding="1rem" textAlign="center">
              Aucun résultat trouvé
            </Text>
          ) : (
            <Text padding="1rem" textAlign="center">
              Tapez au moins 2 caractères
            </Text>
          )}
        </View>
      )}
    </View>
  );
};

export default React.memo(SearchWithSuggestions);