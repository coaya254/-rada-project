import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Politician {
  id: number;
  name: string;
  current_position: string;
  party_history: string[];
  constituency: string;
  wikipedia_summary: string;
  key_achievements: string[];
  education: string;
  image_url?: string;
  party_color?: string;
  slug: string;
}

interface FavoritesContextType {
  favoritePoliticians: Politician[];
  addToFavorites: (politician: Politician) => Promise<void>;
  removeFromFavorites: (politicianId: number) => Promise<void>;
  isFavorite: (politicianId: number) => boolean;
  toggleFavorite: (politician: Politician) => Promise<void>;
  clearFavorites: () => Promise<void>;
  loading: boolean;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

const FAVORITES_STORAGE_KEY = '@favorite_politicians';

export const FavoritesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [favoritePoliticians, setFavoritePoliticians] = useState<Politician[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      setLoading(true);
      const storedFavorites = await AsyncStorage.getItem(FAVORITES_STORAGE_KEY);
      if (storedFavorites) {
        const parsedFavorites = JSON.parse(storedFavorites);
        setFavoritePoliticians(parsedFavorites);
      }
    } catch (error) {
      console.error('Error loading favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveFavorites = async (favorites: Politician[]) => {
    try {
      await AsyncStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
    } catch (error) {
      console.error('Error saving favorites:', error);
    }
  };

  const addToFavorites = async (politician: Politician) => {
    try {
      const updatedFavorites = [...favoritePoliticians, politician];
      setFavoritePoliticians(updatedFavorites);
      await saveFavorites(updatedFavorites);
    } catch (error) {
      console.error('Error adding to favorites:', error);
    }
  };

  const removeFromFavorites = async (politicianId: number) => {
    try {
      const updatedFavorites = favoritePoliticians.filter(p => p.id !== politicianId);
      setFavoritePoliticians(updatedFavorites);
      await saveFavorites(updatedFavorites);
    } catch (error) {
      console.error('Error removing from favorites:', error);
    }
  };

  const isFavorite = (politicianId: number): boolean => {
    return favoritePoliticians.some(p => p.id === politicianId);
  };

  const toggleFavorite = async (politician: Politician) => {
    if (isFavorite(politician.id)) {
      await removeFromFavorites(politician.id);
    } else {
      await addToFavorites(politician);
    }
  };

  const clearFavorites = async () => {
    try {
      setFavoritePoliticians([]);
      await AsyncStorage.removeItem(FAVORITES_STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing favorites:', error);
    }
  };

  const value: FavoritesContextType = {
    favoritePoliticians,
    addToFavorites,
    removeFromFavorites,
    isFavorite,
    toggleFavorite,
    clearFavorites,
    loading,
  };

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = (): FavoritesContextType => {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
};
