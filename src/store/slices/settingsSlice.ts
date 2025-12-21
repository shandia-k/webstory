import { StateCreator } from 'zustand';
import { GameStore } from '../useGameStore';

export interface SettingsSlice {
  settings: {
    apiKey: string;
    language: string;
    volume: number;
  };

  // Actions
  setApiKey: (key: string) => void;
  setLanguage: (lang: string) => void;
  setVolume: (vol: number) => void;
}

export const createSettingsSlice: StateCreator<GameStore, [["zustand/immer", never]], [], SettingsSlice> = (set) => ({
  settings: {
    apiKey: localStorage.getItem('nexus_api_key') || '',
    language: localStorage.getItem('nexus_language') || 'English',
    volume: 0.5
  },

  setApiKey: (key) => set((state) => {
    state.settings.apiKey = key;
    localStorage.setItem('nexus_api_key', key);
  }),

  setLanguage: (lang) => set((state) => {
    state.settings.language = lang;
    localStorage.setItem('nexus_language', lang);
  }),

  setVolume: (vol) => set((state) => {
    state.settings.volume = vol;
  })
});
