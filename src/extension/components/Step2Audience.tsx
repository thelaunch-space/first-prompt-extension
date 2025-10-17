// Step 2: Target Audience Description with premium text input

import React, { useState } from 'react';
import { Users } from 'lucide-react';

interface Step2Props {
  targetAudience: string;
  onAudienceChange: (audience: string) => void;
  onNext: () => void;
  onBack: () => void;
}

export const Step2Audience: React.FC<Step2Props> = ({
  targetAudience,
  onAudienceChange,
  onNext,
  onBack,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const canProceed = targetAudience.trim().length >= 10;
  const charCount = targetAudience.length;

  return (
    <div className="p-8">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 bg-blue-500/10 rounded-lg">
            <Users className="text-blue-400" size={24} />
          </div>
          <h2 className="text-2xl font-bold text-white">Who is this for?</h2>
        </div>
        <p className="text-gray-400">Describe your target audience in detail</p>
        <p className="text-sm text-gray-500 mt-2">
          Be specific about demographics, behaviors, and context
        </p>
      </div>

      <div className="mb-6 relative">
        <label
          className={`absolute left-4 transition-all duration-300 pointer-events-none ${
            isFocused || targetAudience
              ? '-top-2.5 text-xs bg-slate-900 px-2 text-blue-400'
              : 'top-3 text-sm text-gray-500'
          }`}
        >
          Target Audience Description
        </label>
        <textarea
          value={targetAudience}
          onChange={(e) => onAudienceChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="E.g., Small business owners running bootstrapped companies, profitable, based out of US, UK, Canada. They handle their own marketing and operations, value efficiency, and are comfortable with technology but not technical experts."
          className="w-full px-4 py-3 bg-slate-800 border-2 border-slate-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:shadow-lg focus:shadow-blue-500/10 min-h-[140px] resize-none transition-all duration-300"
        />
        <div className={`mt-2 text-xs transition-opacity duration-300 ${charCount > 0 ? 'opacity-100' : 'opacity-0'} ${
          canProceed ? 'text-green-400' : 'text-gray-500'
        }`}>
          {charCount} characters {canProceed ? '✓' : '(minimum 10)'}
        </div>
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
