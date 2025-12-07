export enum Role {
  USER = 'user',
  MODEL = 'model'
}

export type LanguageCode = 'fr' | 'en' | 'ar';

export interface ChatMessage {
  id: string;
  role: Role;
  text: string;
  timestamp: Date;
}

export interface CulturalTopic {
  id: string;
  keywords: string[];
  content: string;
  images?: string[];
  coordinates?: { lat: number; lng: number }; // Ajout des coordonnées pour la map
}

export interface LanguageConfig {
  code: LanguageCode;
  name: string;
  flag: string;
  welcome: string;
  placeholder: string;
  dir: 'ltr' | 'rtl';
}