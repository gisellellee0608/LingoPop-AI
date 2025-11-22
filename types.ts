export enum AppView {
  CONFIG = 'CONFIG',
  SETUP = 'SETUP',
  SEARCH = 'SEARCH',
  NOTEBOOK = 'NOTEBOOK',
  FLASHCARDS = 'FLASHCARDS'
}

export interface Language {
  code: string;
  name: string;
  flag: string;
}

export interface DictionaryExample {
  original: string;
  translation: string;
}

export interface DictionaryEntry {
  id: string; // Unique ID for notebook
  term: string;
  definition: string;
  examples: DictionaryExample[];
  funExplanation: string; // The "friend chat" style explanation
  imageUrl?: string; // Base64 image
  timestamp: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
}

export const SUPPORTED_LANGUAGES: Language[] = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'zh', name: 'Chinese', flag: '🇨🇳' },
  { code: 'es', name: 'Spanish', flag: '🇪🇸' },
  { code: 'fr', name: 'French', flag: '🇫🇷' },
  { code: 'de', name: 'German', flag: '🇩🇪' },
  { code: 'ja', name: 'Japanese', flag: '🇯🇵' },
  { code: 'ko', name: 'Korean', flag: '🇰🇷' },
  { code: 'pt', name: 'Portuguese', flag: '🇧🇷' },
  { code: 'ru', name: 'Russian', flag: '🇷🇺' },
  { code: 'ar', name: 'Arabic', flag: '🇸🇦' },
];

export const AI_MODELS = [
  { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', desc: 'Fast & Smart (Recommended)' },
  { id: 'gemini-flash-lite-latest', name: 'Gemini 2.5 Flash Lite', desc: 'Speed Optimized' },
  { id: 'gemini-2.5-pro-preview', name: 'Gemini 2.5 Pro', desc: 'Advanced Reasoning' },
  { id: 'gemini-3-pro-preview', name: 'Gemini 3 Pro', desc: 'Complex Reasoning' },
];