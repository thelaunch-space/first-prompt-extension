// Step 5: Adaptive Questions based on project type with enhanced UI

import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Settings } from 'lucide-react';

interface Step5Props {
  projectType: string;
  adaptiveAnswers: Record<string, any>;
  onUpdateAnswers: (answers: Record<string, any>) => void;
  onNext: () => void;
  onBack: () => void;
}

export const Step5Adaptive: React.FC<Step5Props> = ({
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
      case 'chrome-extension':
        return (
          <>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Which websites should it work on?
              </label>
              <input
                type="text"
                value={adaptiveAnswers.targetWebsites || ''}
                onChange={(e) => handleAnswerChange('targetWebsites', e.target.value)}
                placeholder="E.g., All websites, YouTube, Gmail, Specific domains"
                className="w-full px-4 py-3 bg-slate-800 border-2 border-slate-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300"
              />
            </div>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-3">
                What should it do on those pages?
              </label>
              <div className="space-y-2">
                {['Add new features to the page', 'Modify existing content', 'Both'].map((option) => (
                  <button
                    key={option}
                    onClick={() => handleAnswerChange('extensionAction', option)}
                    className={`w-full p-3 rounded-xl border-2 text-left transition-all duration-300 ${
                      adaptiveAnswers.extensionAction === option
                        ? 'border-purple-500 bg-gradient-to-r from-purple-500/10 to-blue-500/10 text-white shadow-lg shadow-purple-500/20'
                        : 'border-slate-700 bg-slate-800/50 text-gray-300 hover:border-slate-600 hover:bg-slate-800'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          </>
        );

      case 'mobile-app':
        return (
          <>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Does it need to work offline?
              </label>
              <div className="space-y-2">
                {['Yes', 'No', 'Partially'].map((option) => (
                  <button
                    key={option}
                    onClick={() => handleAnswerChange('offlineSupport', option)}
                    className={`w-full p-3 rounded-xl border-2 text-left transition-all duration-300 ${
                      adaptiveAnswers.offlineSupport === option
                        ? 'border-purple-500 bg-gradient-to-r from-purple-500/10 to-blue-500/10 text-white shadow-lg shadow-purple-500/20'
                        : 'border-slate-700 bg-slate-800/50 text-gray-300 hover:border-slate-600 hover:bg-slate-800'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Should users be able to sign in?
              </label>
              <div className="space-y-2">
                {['Yes, required', 'Yes, optional', 'No'].map((option) => (
                  <button
                    key={option}
                    onClick={() => handleAnswerChange('mobileAuth', option)}
                    className={`w-full p-3 rounded-xl border-2 text-left transition-all duration-300 ${
                      adaptiveAnswers.mobileAuth === option
                        ? 'border-purple-500 bg-gradient-to-r from-purple-500/10 to-blue-500/10 text-white shadow-lg shadow-purple-500/20'
                        : 'border-slate-700 bg-slate-800/50 text-gray-300 hover:border-slate-600 hover:bg-slate-800'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          </>
        );

      case 'web-app':
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
                    className={`w-full p-3 rounded-xl border-2 text-left transition-all duration-300 ${
                      adaptiveAnswers.needsAuth === option
                        ? 'border-purple-500 bg-gradient-to-r from-purple-500/10 to-blue-500/10 text-white shadow-lg shadow-purple-500/20'
                        : 'border-slate-700 bg-slate-800/50 text-gray-300 hover:border-slate-600 hover:bg-slate-800'
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
                className="w-full px-4 py-3 bg-slate-800 border-2 border-slate-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300"
              />
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
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 bg-purple-500/10 rounded-lg">
            <Settings className="text-purple-400" size={24} />
          </div>
          <h2 className="text-2xl font-bold text-white">Additional Details</h2>
        </div>
        <p className="text-gray-400">Help us understand your specific requirements</p>
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
              className="w-full px-4 py-3 bg-slate-800 border-2 border-slate-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:shadow-lg focus:shadow-purple-500/10 min-h-[100px] resize-none transition-all duration-300"
            />
          </div>
        )}
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
          className="flex-1 py-3 px-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-purple-700 hover:shadow-lg hover:shadow-purple-500/30 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-300"
        >
          Next
        </button>
      </div>
    </div>
  );
};
