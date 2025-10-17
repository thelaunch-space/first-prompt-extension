// Step 1: Project Type Selection

import React from 'react';
import { ProjectTypeOption } from '../types';

interface Step1Props {
  selectedType: string;
  customType: string;
  onSelectType: (type: string) => void;
  onCustomTypeChange: (value: string) => void;
  onNext: () => void;
}

const PROJECT_TYPES: ProjectTypeOption[] = [
  { value: 'saas', label: 'SaaS App' },
  { value: 'landing', label: 'Landing Page' },
  { value: 'internal', label: 'Internal Tool' },
  { value: 'dashboard', label: 'Dashboard' },
  { value: 'game', label: 'Game' },
  { value: 'other', label: 'Other' },
];

export const Step1ProjectType: React.FC<Step1Props> = ({
  selectedType,
  customType,
  onSelectType,
  onCustomTypeChange,
  onNext,
}) => {
  const canProceed = selectedType !== '' && (selectedType !== 'other' || customType.trim() !== '');

  return (
    <div className="p-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">What are you building?</h2>
        <p className="text-gray-400">Select a project type or describe your own</p>
      </div>

      <div className="space-y-3 mb-6">
        {PROJECT_TYPES.map((type) => (
          <button
            key={type.value}
            onClick={() => onSelectType(type.value)}
            className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
              selectedType === type.value
                ? 'border-blue-500 bg-blue-500/10 text-white'
                : 'border-slate-700 bg-slate-800/50 text-gray-300 hover:border-slate-600'
            }`}
          >
            {type.label}
          </button>
        ))}
      </div>

      {selectedType === 'other' && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Describe your project
          </label>
          <textarea
            value={customType}
            onChange={(e) => onCustomTypeChange(e.target.value)}
            placeholder="E.g., A Chrome extension for productivity tracking"
            className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[100px] resize-none"
          />
        </div>
      )}

      <button
        onClick={onNext}
        disabled={!canProceed}
        className="w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium rounded-lg hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Next
      </button>
    </div>
  );
};
