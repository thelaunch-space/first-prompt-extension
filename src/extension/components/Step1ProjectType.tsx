// Step 1: Project Type Selection with enhanced premium UI

import React from 'react';
import { Chrome, Layers, Smartphone, FileText, MoreHorizontal } from 'lucide-react';
import { ProjectTypeOption } from '../types';

interface Step1Props {
  selectedType: string;
  customType: string;
  onSelectType: (type: string) => void;
  onCustomTypeChange: (value: string) => void;
  onNext: () => void;
}

const PROJECT_TYPES: ProjectTypeOption[] = [
  { value: 'chrome-extension', label: 'Chrome Extension' },
  { value: 'micro-saas', label: 'Micro-SaaS App' },
  { value: 'mobile-app', label: 'Mobile App' },
  { value: 'landing', label: 'Landing Page' },
  { value: 'other', label: 'Other' },
];

const getProjectIcon = (value: string) => {
  switch (value) {
    case 'chrome-extension':
      return <Chrome size={24} />;
    case 'micro-saas':
      return <Layers size={24} />;
    case 'mobile-app':
      return <Smartphone size={24} />;
    case 'landing':
      return <FileText size={24} />;
    case 'other':
      return <MoreHorizontal size={24} />;
    default:
      return null;
  }
};

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
            className={`group w-full p-4 rounded-xl border-2 text-left transition-all duration-300 flex items-center gap-4 ${
              selectedType === type.value
                ? 'border-blue-500 bg-gradient-to-r from-blue-500/10 to-purple-500/10 text-white shadow-lg shadow-blue-500/20'
                : 'border-slate-700 bg-slate-800/50 text-gray-300 hover:border-slate-600 hover:bg-slate-800 hover:shadow-md hover:scale-[1.02]'
            }`}
          >
            <div className={`transition-colors duration-300 ${
              selectedType === type.value ? 'text-blue-400' : 'text-gray-500 group-hover:text-gray-400'
            }`}>
              {getProjectIcon(type.value)}
            </div>
            <span className="font-medium">{type.label}</span>
          </button>
        ))}
      </div>

      {selectedType === 'other' && (
        <div className="mb-6 animate-fadeIn">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Describe your project
          </label>
          <textarea
            value={customType}
            onChange={(e) => onCustomTypeChange(e.target.value)}
            placeholder="E.g., A financial planning tool for freelancers"
            className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:shadow-lg focus:shadow-blue-500/10 min-h-[100px] resize-none transition-all duration-300"
          />
        </div>
      )}

      <button
        onClick={onNext}
        disabled={!canProceed}
        className="w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-purple-700 hover:shadow-lg hover:shadow-purple-500/30 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none"
      >
        Next
      </button>
    </div>
  );
};
