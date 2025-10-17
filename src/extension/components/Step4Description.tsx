// Step 4: Solution Description - What should the app do to solve the problems

import React from 'react';
import { Lightbulb } from 'lucide-react';

interface Step4Props {
  projectDescription: string;
  onDescriptionChange: (description: string) => void;
  onNext: () => void;
  onBack: () => void;
}

export const Step4Description: React.FC<Step4Props> = ({
  projectDescription,
  onDescriptionChange,
  onNext,
  onBack,
}) => {
  const canProceed = projectDescription.trim().length >= 20;
  const charCount = projectDescription.length;

  return (
    <div className="p-8">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 bg-green-500/10 rounded-lg">
            <Lightbulb className="text-green-400" size={24} />
          </div>
          <h2 className="text-2xl font-bold text-white">What should this app do?</h2>
        </div>
        <p className="text-gray-400">Describe the solution you envision</p>
        <p className="text-sm text-gray-500 mt-2">
          Focus on what users will accomplish, not technical details
        </p>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Solution Description
        </label>
        <textarea
          value={projectDescription}
          onChange={(e) => onDescriptionChange(e.target.value)}
          placeholder="E.g., The app should centralize all customer messages in one dashboard, automatically categorize inquiries, send follow-up reminders, generate response templates, and provide analytics showing which channels bring in the most valuable customers."
          className="w-full px-4 py-3 bg-slate-800 border-2 border-slate-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 focus:shadow-lg focus:shadow-green-500/10 min-h-[160px] resize-none transition-all duration-300"
        />
        <div className={`mt-2 text-xs transition-opacity duration-300 ${charCount > 0 ? 'opacity-100' : 'opacity-0'} ${
          canProceed ? 'text-green-400' : 'text-gray-500'
        }`}>
          {charCount} characters {canProceed ? '✓' : '(minimum 20)'}
        </div>
      </div>

      <div className="mb-6 p-4 bg-slate-800/50 border border-slate-700 rounded-xl">
        <p className="text-sm text-gray-400 leading-relaxed">
          <span className="font-semibold text-gray-300">Tip:</span> Describe the user experience and outcomes. What will users be able to do? What results will they achieve? Think in terms of actions and benefits.
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
