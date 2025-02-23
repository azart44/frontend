import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Button, 
  View, 
  SearchField, 
  Text 
} from '@aws-amplify/ui-react';
import { useApi } from '../hooks/useApi';
import { UserSuggestion } from '../types/types';

const SEARCH_DELAY = 1000; // 1 seconde

const SearchWithSuggestions: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState<UserSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { callApi, isLoading, error } = useApi();
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSearchTermRef = useRef<string>('');

  const performSearch = useCallback(async (term: string) => {
    if (term.trim() !== '') {
      console.log('Searching for:', term);
      try {
        const response = await callApi(`/search-profiles?term=${encodeURIComponent(term)}`);
        console.log('API response:', response);
        if (response && Array.isArray(response)) {
          const uniqueSuggestions = response.filter((suggestion, index, self) =>
            index === self.findIndex((t) => t.userId === suggestion.userId)
          );
          setSuggestions(uniqueSuggestions);
          setShowSuggestions(true);
        }
      } catch (error) {
        console.error('Error fetching suggestions:', error);
      }
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
    lastSearchTermRef.current = term;
  }, [callApi]);

  useEffect(() => {
    if (searchTerm !== lastSearchTermRef.current) {
      if (searchTerm.length === 1 || searchTerm.length < lastSearchTermRef.current.length) {
        performSearch(searchTerm);
      } else {
        if (searchTimeoutRef.current) {
          clearTimeout(searchTimeoutRef.current);
        }
        searchTimeoutRef.current = setTimeout(() => {
          performSearch(searchTerm);
        }, SEARCH_DELAY);
      }
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchTerm, performSearch]);

  useEffect(() => {
    const clearSearch = () => {
      setSearchTerm('');
      setSuggestions([]);
      setShowSuggestions(false);
    };

    clearSearch();

    return () => {
      clearSearch();
    };
  }, [location]);

  const handleSearchChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const newTerm = event.target.value;
    setSearchTerm(newTerm);
  }, []);

  const handleSuggestionClick = useCallback((userId: string) => {
    console.log('Suggestion clicked:', userId);
    navigate(`/profile/${userId}`);
    setShowSuggestions(false);
    setSearchTerm('');
  }, [navigate]);

  const handleClearSearch = useCallback(() => {
    setSearchTerm('');
    setSuggestions([]);
    setShowSuggestions(false);
  }, []);

  return (
    <View position="relative">
      <SearchField
        label="Search"
        placeholder="Search for users..."
        width="300px"
        value={searchTerm}
        onChange={handleSearchChange}
        onFocus={() => setShowSuggestions(true)}
        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
        innerEndComponent={
          searchTerm && (
            <Button
              onClick={handleClearSearch}
              variation="link"
              style={{
                position: 'absolute',
                right: '8px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              ✕
            </Button>
          )
        }
      />
      {isLoading && <Text>Loading...</Text>}
      {error && <Text color="red">{error}</Text>}
      {showSuggestions && suggestions.length > 0 && (
        <View
          position="absolute"
          top="100%"
          left="0"
          right="0"
          backgroundColor="white"
          borderRadius="medium"
          boxShadow="medium"
          maxHeight="200px"
          overflow="auto"
          style={{ zIndex: 1 }}
        >
          {suggestions.map((suggestion) => (
            <Button
              key={suggestion.userId}
              onClick={() => handleSuggestionClick(suggestion.userId)}
              variation="link"
              width="100%"
              textAlign="left"
              padding="0.5rem"
            >
              <Text>{suggestion.name || suggestion.userId}</Text>
            </Button>
          ))}
        </View>
      )}
    </View>
  );
};

export default SearchWithSuggestions;