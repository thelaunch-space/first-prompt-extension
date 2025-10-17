// Step 3: Pain Points - Identifying target audience problems and frustrations

import React from 'react';
import { AlertCircle } from 'lucide-react';

interface Step3Props {
  painPoints: string;
  onPainPointsChange: (painPoints: string) => void;
  onNext: () => void;
  onBack: () => void;
}

export const Step3PainPoints: React.FC<Step3Props> = ({
  painPoints,
  onPainPointsChange,
  onNext,
  onBack,
}) => {
  const canProceed = painPoints.trim().length >= 10;
  const charCount = painPoints.length;

  return (
    <div className="p-8">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 bg-orange-500/10 rounded-lg">
            <AlertCircle className="text-orange-400" size={24} />
          </div>
          <h2 className="text-2xl font-bold text-white">What problems do they face?</h2>
        </div>
        <p className="text-gray-400">Describe the pain points and frustrations</p>
        <p className="text-sm text-gray-500 mt-2">
          Be specific about daily frustrations and bottlenecks
        </p>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Pain Points & Frustrations
        </label>
        <textarea
          value={painPoints}
          onChange={(e) => onPainPointsChange(e.target.value)}
          placeholder="E.g., They struggle to manage customer inquiries across multiple channels (email, social media, phone), miss important follow-ups, waste hours on repetitive admin tasks, and can't easily track which marketing efforts bring in customers."
          className="w-full px-4 py-3 bg-slate-800 border-2 border-slate-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:shadow-lg focus:shadow-orange-500/10 min-h-[140px] resize-none transition-all duration-300"
        />
        <div className={`mt-2 text-xs transition-opacity duration-300 ${charCount > 0 ? 'opacity-100' : 'opacity-0'} ${
          canProceed ? 'text-green-400' : 'text-gray-500'
        }`}>
          {charCount} characters {canProceed ? '✓' : '(minimum 10)'}
        </div>
      </div>

      <div className="mb-6 p-4 bg-slate-800/50 border border-slate-700 rounded-xl">
        <p className="text-sm text-gray-400 leading-relaxed">
          <span className="font-semibold text-gray-300">Tip:</span> Think about what keeps your audience up at night. What tasks do they dread? What slows them down? What causes errors or missed opportunities?
        </p>
      </div>

      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="flex-1 py-3 px-4 bg-slate-700 text-white font-semibold rounded-xl hover:bg-slate-600 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-slate-500 transition-all duration-300"
        >
          Back
        </button>
        <button
          onClick={onNext}
          disabled={!canProceed}
          className="flex-1 py-3 px-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-purple-700 hover:shadow-lg hover:shadow-purple-500/30 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none"
        >
          Next
        </button>
      </div>
    </div>
  );
};
