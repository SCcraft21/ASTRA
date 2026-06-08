export interface APIKey {
  id: string;
  name: string;
  value: string;
  status: "Active" | "Revoked";
}

export interface ChatMessage {
  id: string;
  role: "user" | "model";
  content: string;
  date?: string;
  simulated?: boolean;
}

export interface TelemetryMetrics {
  apiCallsCurrent: number;
  apiCallsMax: number;
  memoryUsage: number;
}

export interface CrewMember {
  id: string;
  name: string;
  title: string;
  image: string;
  hr: number;
  o2: number;
  isFavorite: boolean;
}

export interface MissionLog {
  id: string;
  title: string;
  desc: string;
  rawTime: string;
}

export type ViewType = "landing" | "login" | "dashboard" | "developer-console";
