// Step 4: Adaptive Questions based on project type

import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface Step4Props {
  projectType: string;
  adaptiveAnswers: Record<string, any>;
  onUpdateAnswers: (answers: Record<string, any>) => void;
  onNext: () => void;
  onBack: () => void;
}

export const Step4Adaptive: React.FC<Step4Props> = ({
  projectType,
  adaptiveAnswers,
  onUpdateAnswers,
  onNext,
  onBack,
}) => {
  const [showOptional, setShowOptional] = useState(false);

  const handleAnswerChange = (key: string, value: any) => {
    onUpdateAnswers({ ...adaptiveAnswers, [key]: value });
  };

  const renderQuestions = () => {
    switch (projectType) {
      case 'saas':
      case 'dashboard':
        return (
          <>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Do you need user authentication?
              </label>
              <div className="space-y-2">
                {['Yes', 'No', 'Not sure'].map((option) => (
                  <button
                    key={option}
                    onClick={() => handleAnswerChange('needsAuth', option)}
                    className={`w-full p-3 rounded-lg border-2 text-left transition-all ${
                      adaptiveAnswers.needsAuth === option
                        ? 'border-blue-500 bg-blue-500/10 text-white'
                        : 'border-slate-700 bg-slate-800/50 text-gray-300 hover:border-slate-600'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          </>
        );

      case 'landing':
        return (
          <>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                What main action should visitors take?
              </label>
              <input
                type="text"
                value={adaptiveAnswers.mainAction || ''}
                onChange={(e) => handleAnswerChange('mainAction', e.target.value)}
                placeholder="E.g., Sign up for beta, Schedule a demo, Download app"
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </>
        );

      case 'internal':
        return (
          <>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Team size
              </label>
              <div className="space-y-2">
                {['Just me', 'Small team (2-10)', 'Company-wide (10+)'].map((option) => (
                  <button
                    key={option}
                    onClick={() => handleAnswerChange('teamSize', option)}
                    className={`w-full p-3 rounded-lg border-2 text-left transition-all ${
                      adaptiveAnswers.teamSize === option
                        ? 'border-blue-500 bg-blue-500/10 text-white'
                        : 'border-slate-700 bg-slate-800/50 text-gray-300 hover:border-slate-600'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div className="p-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">Additional Details</h2>
        <p className="text-gray-400">Help us understand your requirements</p>
      </div>

      {renderQuestions()}

      <div className="mb-6">
        <button
          onClick={() => setShowOptional(!showOptional)}
          className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors"
          type="button"
        >
          {showOptional ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          Want to add more details?
        </button>

        {showOptional && (
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Business logic or specific requirements
            </label>
            <textarea
              value={adaptiveAnswers.additionalDetails || ''}
              onChange={(e) => handleAnswerChange('additionalDetails', e.target.value)}
              placeholder="Any specific workflows, integrations, or business rules..."
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[100px] resize-none"
            />
          </div>
        )}
      </div>

      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="flex-1 py-3 px-4 bg-slate-700 text-white font-medium rounded-lg hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-500 transition-all"
        >
          Back
        </button>
        <button
          onClick={onNext}
          className="flex-1 py-3 px-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium rounded-lg hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
        >
          Next
        </button>
      </div>
    </div>
  );
};
