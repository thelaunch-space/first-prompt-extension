// Step 2: Target Audience Selection

import React from 'react';

interface Step2Props {
  selectedAudience: string;
  customAudience: string;
  onSelectAudience: (audience: string) => void;
  onCustomAudienceChange: (value: string) => void;
  onNext: () => void;
  onBack: () => void;
}

const AUDIENCE_OPTIONS = [
  { value: 'founders', label: 'Startup Founders' },
  { value: 'businesses', label: 'Small Businesses' },
  { value: 'students', label: 'Students' },
  { value: 'consumers', label: 'General Consumers' },
  { value: 'enterprise', label: 'Enterprise Teams' },
  { value: 'custom', label: 'Custom Audience' },
];

export const Step2Audience: React.FC<Step2Props> = ({
  selectedAudience,
  customAudience,
  onSelectAudience,
  onCustomAudienceChange,
  onNext,
  onBack,
}) => {
  const canProceed =
    selectedAudience !== '' && (selectedAudience !== 'custom' || customAudience.trim() !== '');

  return (
    <div className="p-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">Who is this for?</h2>
        <p className="text-gray-400">Select your target audience</p>
      </div>

      <div className="space-y-3 mb-6">
        {AUDIENCE_OPTIONS.map((option) => (
          <button
            key={option.value}
            onClick={() => onSelectAudience(option.value)}
            className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
              selectedAudience === option.value
                ? 'border-blue-500 bg-blue-500/10 text-white'
                : 'border-slate-700 bg-slate-800/50 text-gray-300 hover:border-slate-600'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      {selectedAudience === 'custom' && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Describe your target audience
          </label>
          <textarea
            value={customAudience}
            onChange={(e) => onCustomAudienceChange(e.target.value)}
            placeholder="E.g., Freelance designers who need client management tools"
            className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[100px] resize-none"
          />
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="flex-1 py-3 px-4 bg-slate-700 text-white font-medium rounded-lg hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-500 transition-all"
        >
          Back
        </button>
        <button
          onClick={onNext}
          disabled={!canProceed}
          className="flex-1 py-3 px-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium rounded-lg hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    </div>
  );
};
