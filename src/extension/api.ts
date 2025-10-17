// API client for communicating with Supabase Edge Functions

import { AuthResponse, GenerateResponse, QuestionnaireData } from './types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

class ApiClient {
  private getAuthToken(): string | null {
    return localStorage.getItem('bolt_prompt_generator_token');
  }

  private getHeaders(includeAuth = false): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (includeAuth) {
      const token = this.getAuthToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    return headers;
  }

  async signup(email: string, password: string): Promise<AuthResponse> {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/auth/signup`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Signup failed');
    }

    const data = await response.json();
    localStorage.setItem('bolt_prompt_generator_token', data.token);
    return data;
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/auth/login`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Login failed');
    }

    const data = await response.json();
    localStorage.setItem('bolt_prompt_generator_token', data.token);
    return data;
  }

  async verifyToken(): Promise<{ user: any } | null> {
    const token = this.getAuthToken();
    if (!token) return null;

    try {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/auth/verify`, {
        method: 'GET',
        headers: this.getHeaders(true),
      });

      if (!response.ok) {
        localStorage.removeItem('bolt_prompt_generator_token');
        return null;
      }

      return await response.json();
    } catch {
      localStorage.removeItem('bolt_prompt_generator_token');
      return null;
    }
  }

  async generatePrompt(data: QuestionnaireData, refinementInstructions?: string): Promise<GenerateResponse> {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/generate-prompt`, {
      method: 'POST',
      headers: this.getHeaders(true),
      body: JSON.stringify({
        projectType: data.customProjectType || data.projectType,
        targetAudience: data.customAudience || data.targetAudience,
        coreFeatures: data.coreFeatures,
        adaptiveAnswers: data.adaptiveAnswers,
        designPreferences: data.designPreferences,
        refinementInstructions,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to generate prompt');
    }

    return await response.json();
  }

  async trackUsage(generationId: string, action: 'edited' | 'copied'): Promise<void> {
    await fetch(`${SUPABASE_URL}/functions/v1/track-usage`, {
      method: 'POST',
      headers: this.getHeaders(true),
      body: JSON.stringify({ generationId, action }),
    });
  }

  logout(): void {
    localStorage.removeItem('bolt_prompt_generator_token');
  }
}

export const apiClient = new ApiClient();
