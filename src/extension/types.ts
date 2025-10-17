// Extension types and interfaces

export interface User {
  id: string;
  email: string;
  created_at: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface QuestionnaireData {
  projectType: string;
  customProjectType?: string;
  targetAudience: string;
  customAudience?: string;
  coreFeatures: string[];
  adaptiveAnswers: Record<string, any>;
  designPreferences: {
    style: string;
    colors?: string;
    customStyle?: string;
  };
}

export interface GenerateResponse {
  prompt: string;
  generationId: string;
}

export type Step = 1 | 2 | 3 | 4 | 5 | 'preview';

export interface ProjectTypeOption {
  value: string;
  label: string;
}

export interface DesignStyleOption {
  value: string;
  label: string;
  description: string;
}
