import { create } from 'zustand';
import { Product } from '../types';

interface SearchState {
  lastQuery: string;
  lastResults: Product[];
  setSearchResults: (query: string, results: Product[]) => void;
}

export const useSearchStore = create<SearchState>((set) => ({
  lastQuery: '',
  lastResults: [],
  setSearchResults: (query, results) => set({ lastQuery: query, lastResults: results }),
}));
