export enum Role {
  USER = 'user',
  MODEL = 'model'
}

export interface Message {
  id: string;
  role: Role;
  text: string;
  timestamp: number;
  type?: 'text' | 'analysis_result';
}

export enum AffinityStage {
  STRANGER = 0,    // "Stranger/Hostile" - 0 to 20
  ACQUAINTANCE = 1, // "Observing" - 21 to 50
  COMPANION = 2,    // "Protector" - 51 to 80
  SOULMATE = 3      // "Devoted" - 81+
}

export interface CharacterState {
  affinity: number; // 0 - 100
  stage: AffinityStage;
  memories: string[]; // Summary of past interactions
}

export interface ArtifactAnalysis {
  fileName: string;
  fileType: string;
  analysis: string;
}

export type Language = 'en' | 'zh';