export type AppTab = 'home' | 'chat' | 'memory' | 'api-keys';

export type AuthScreen = 'login' | 'register' | 'authorized';

export interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  loading?: boolean;
  citations?: { title: string; url: string }[];
  chartData?: { label: string; value: number }[] | null;
}

export interface ContextLayer {
  id: string;
  title: string;
  description: string;
  updated: string;
  active: boolean;
}

export interface LearnedInsight {
  id: string;
  title: string;
  content: string;
  match: number;
  type: string;
  date: string;
}
