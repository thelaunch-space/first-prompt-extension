// Authentication form component for login and signup

import React, { useState } from 'react';
import { apiClient } from '../api';
import { User } from '../types';

interface AuthFormProps {
  onAuthenticated: (user: User) => void;
  onError: (message: string) => void;
}

export const AuthForm: React.FC<AuthFormProps> = ({ onAuthenticated, onError }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const iconUrl = chrome.runtime.getURL('icon48.png');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      onError('Please enter both email and password');
      return;
    }

    if (password.length < 6) {
      onError('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);
    try {
      const response = isLogin
        ? await apiClient.login(email, password)
        : await apiClient.signup(email, password);

      onAuthenticated(response.user);
    } catch (error: any) {
      onError(error.message || 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-8">
      <div className="flex justify-center mb-4">
        <img src={iconUrl} alt="Bolt Prompt Generator" className="w-16 h-16" />
      </div>

      <h2 className="text-2xl font-bold text-white mb-2 text-center">
        {isLogin ? 'Welcome Back' : 'Get Started'}
      </h2>
      <p className="text-gray-400 mb-6 text-center">
        {isLogin
          ? 'Sign in to generate optimized Bolt.new prompts'
          : 'Create an account to start generating prompts'}
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
            Email
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="you@example.com"
            disabled={isLoading}
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
            Password
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="••••••••"
            disabled={isLoading}
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium rounded-lg hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-slate-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Create Account')}
        </button>
      </form>

      <div className="mt-6 text-center">
        <button
          onClick={() => setIsLogin(!isLogin)}
          className="text-sm text-gray-400 hover:text-white transition-colors"
          disabled={isLoading}
        >
          {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
        </button>
      </div>
    </div>
  );
};
