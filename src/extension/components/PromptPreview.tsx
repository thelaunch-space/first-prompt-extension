// Prompt Preview with edit, regenerate, and copy functionality

import React, { useState } from 'react';
import { Copy, Edit2, RotateCw, Check } from 'lucide-react';
import { apiClient } from '../api';
import { QuestionnaireData } from '../types';

interface PromptPreviewProps {
  prompt: string;
  generationId: string;
  questionnaireData: QuestionnaireData;
  onBack: () => void;
  onRegenerate: (newPrompt: string) => void;
  onReset: () => void;
  onError?: (message: string) => void;
}

export const PromptPreview: React.FC<PromptPreviewProps> = ({
  prompt,
  generationId,
  questionnaireData,
  onBack,
  onRegenerate,
  onReset,
  onError,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedPrompt, setEditedPrompt] = useState(prompt);
  const [refinementInput, setRefinementInput] = useState('');
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [error, setError] = useState('');

  const handleEdit = async () => {
    setIsEditing(true);
    if (!isEditing) {
      try {
        await apiClient.trackUsage(generationId, 'edited');
      } catch (err: any) {
        if (err.message === 'SESSION_EXPIRED' && onError) {
          onError(err.message);
        }
      }
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(isEditing ? editedPrompt : prompt);
      setIsCopied(true);
      try {
        await apiClient.trackUsage(generationId, 'copied');
      } catch (err: any) {
        if (err.message === 'SESSION_EXPIRED' && onError) {
          onError(err.message);
          return;
        }
      }
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      setError('Failed to copy to clipboard');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleRegenerate = async () => {
    setIsRegenerating(true);
    setError('');
    try {
      const response = await apiClient.generatePrompt(questionnaireData);
      onRegenerate(response.prompt);
      setEditedPrompt(response.prompt);
      setIsEditing(false);
    } catch (err: any) {
      if (err.message === 'SESSION_EXPIRED' && onError) {
        onError(err.message);
      } else {
        setError(err.message || 'Failed to regenerate prompt');
      }
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleRefine = async () => {
    if (!refinementInput.trim()) return;

    setIsRegenerating(true);
    setError('');
    try {
      const response = await apiClient.generatePrompt(questionnaireData, refinementInput);
      onRegenerate(response.prompt);
      setEditedPrompt(response.prompt);
      setRefinementInput('');
      setIsEditing(false);
    } catch (err: any) {
      if (err.message === 'SESSION_EXPIRED' && onError) {
        onError(err.message);
      } else {
        setError(err.message || 'Failed to refine prompt');
      }
    } finally {
      setIsRegenerating(false);
    }
  };

  return (
    <div className="p-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">Your Bolt.new Prompt</h2>
        <p className="text-gray-400">Review, edit, or copy to use in Bolt.new</p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500 rounded-lg text-red-400 text-sm">
          {error}
        </div>
      )}

      <div className="mb-4">
        <textarea
          value={isEditing ? editedPrompt : prompt}
          onChange={(e) => setEditedPrompt(e.target.value)}
          readOnly={!isEditing}
          className={`w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[300px] max-h-[400px] resize-y ${
            !isEditing ? 'cursor-default' : ''
          }`}
        />
      </div>

      <div className="flex gap-2 mb-6">
        <button
          onClick={handleEdit}
          className="flex items-center gap-2 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-all"
        >
          <Edit2 size={16} />
          {isEditing ? 'Editing...' : 'Edit'}
        </button>
        <button
          onClick={handleRegenerate}
          disabled={isRegenerating}
          className="flex items-center gap-2 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RotateCw size={16} className={isRegenerating ? 'animate-spin' : ''} />
          Regenerate
        </button>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Refine the prompt
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={refinementInput}
            onChange={(e) => setRefinementInput(e.target.value)}
            placeholder="E.g., make it more technical, add mobile app features"
            className="flex-1 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            onKeyPress={(e) => e.key === 'Enter' && handleRefine()}
          />
          <button
            onClick={handleRefine}
            disabled={!refinementInput.trim() || isRegenerating}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Refine
          </button>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={onReset}
          className="px-6 py-3 bg-slate-700 text-white font-medium rounded-lg hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-500 transition-all"
        >
          Start Over
        </button>
        <button
          onClick={onBack}
          className="px-6 py-3 bg-slate-700 text-white font-medium rounded-lg hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-500 transition-all"
        >
          Back
        </button>
        <button
          onClick={handleCopy}
          className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium rounded-lg hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
        >
          {isCopied ? (
            <>
              <Check size={20} />
              Copied!
            </>
          ) : (
            <>
              <Copy size={20} />
              Copy to Bolt.new
            </>
          )}
        </button>
      </div>
    </div>
  );
};
