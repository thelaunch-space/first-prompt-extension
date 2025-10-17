// Main modal container that orchestrates the entire flow

import React, { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import { AuthForm } from './AuthForm';
import { Step1ProjectType } from './Step1ProjectType';
import { Step2Audience } from './Step2Audience';
import { Step3Features } from './Step3Features';
import { Step4Adaptive } from './Step4Adaptive';
import { Step5Design } from './Step5Design';
import { PromptPreview } from './PromptPreview';
import { apiClient } from '../api';
import { User, QuestionnaireData, Step } from '../types';

interface ModalContainerProps {
  onClose: () => void;
}

export const ModalContainer: React.FC<ModalContainerProps> = ({ onClose }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [error, setError] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPrompt, setGeneratedPrompt] = useState('');
  const [generationId, setGenerationId] = useState('');

  const [questionnaireData, setQuestionnaireData] = useState<QuestionnaireData>({
    projectType: '',
    customProjectType: '',
    targetAudience: '',
    customAudience: '',
    coreFeatures: ['', ''],
    adaptiveAnswers: {},
    designPreferences: {
      style: '',
      colors: '',
      customStyle: '',
    },
  });

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const result = await apiClient.verifyToken();
    if (result) {
      setUser(result.user);
    }
    setIsCheckingAuth(false);
  };

  const handleAuthenticated = (authenticatedUser: User) => {
    setUser(authenticatedUser);
    setError('');
  };

  const handleError = (message: string) => {
    setError(message);
    setTimeout(() => setError(''), 5000);
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError('');
    try {
      const response = await apiClient.generatePrompt(questionnaireData);
      setGeneratedPrompt(response.prompt);
      setGenerationId(response.generationId);
      setCurrentStep('preview');
    } catch (err: any) {
      handleError(err.message || 'Failed to generate prompt');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleReset = () => {
    setCurrentStep(1);
    setQuestionnaireData({
      projectType: '',
      customProjectType: '',
      targetAudience: '',
      customAudience: '',
      coreFeatures: ['', ''],
      adaptiveAnswers: {},
      designPreferences: {
        style: '',
        colors: '',
        customStyle: '',
      },
    });
    setGeneratedPrompt('');
    setGenerationId('');
  };

  const renderProgressBar = () => {
    if (currentStep === 'preview') return null;

    const progress = (currentStep / 5) * 100;

    return (
      <div className="px-8 pt-6 pb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-400">Step {currentStep} of 5</span>
          <span className="text-sm text-gray-400">{Math.round(progress)}%</span>
        </div>
        <div className="w-full bg-slate-800 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    );
  };

  const renderContent = () => {
    if (isCheckingAuth) {
      return (
        <div className="p-8 flex items-center justify-center min-h-[400px]">
          <Loader2 className="animate-spin text-blue-500" size={40} />
        </div>
      );
    }

    if (!user) {
      return <AuthForm onAuthenticated={handleAuthenticated} onError={handleError} />;
    }

    if (isGenerating) {
      return (
        <div className="p-8 flex flex-col items-center justify-center min-h-[400px]">
          <Loader2 className="animate-spin text-blue-500 mb-6" size={48} />
          <p className="text-white text-xl font-semibold mb-3">Crafting your perfect prompt...</p>
          <p className="text-gray-300 text-sm text-center max-w-md leading-relaxed">
            Our AI is analyzing your answers and building a detailed prompt that Bolt will love.
          </p>
          <p className="text-blue-400 text-sm mt-2 font-medium">
            Get ready to build something amazing!
          </p>
        </div>
      );
    }

    if (currentStep === 'preview') {
      return (
        <PromptPreview
          prompt={generatedPrompt}
          generationId={generationId}
          questionnaireData={questionnaireData}
          onBack={() => setCurrentStep(5)}
          onRegenerate={(newPrompt) => setGeneratedPrompt(newPrompt)}
          onReset={handleReset}
        />
      );
    }

    switch (currentStep) {
      case 1:
        return (
          <Step1ProjectType
            selectedType={questionnaireData.projectType}
            customType={questionnaireData.customProjectType || ''}
            onSelectType={(type) =>
              setQuestionnaireData({ ...questionnaireData, projectType: type })
            }
            onCustomTypeChange={(value) =>
              setQuestionnaireData({ ...questionnaireData, customProjectType: value })
            }
            onNext={() => setCurrentStep(2)}
          />
        );

      case 2:
        return (
          <Step2Audience
            selectedAudience={questionnaireData.targetAudience}
            customAudience={questionnaireData.customAudience || ''}
            onSelectAudience={(audience) =>
              setQuestionnaireData({ ...questionnaireData, targetAudience: audience })
            }
            onCustomAudienceChange={(value) =>
              setQuestionnaireData({ ...questionnaireData, customAudience: value })
            }
            onNext={() => setCurrentStep(3)}
            onBack={() => setCurrentStep(1)}
          />
        );

      case 3:
        return (
          <Step3Features
            features={questionnaireData.coreFeatures}
            onUpdateFeatures={(features) =>
              setQuestionnaireData({ ...questionnaireData, coreFeatures: features })
            }
            onNext={() => setCurrentStep(4)}
            onBack={() => setCurrentStep(2)}
          />
        );

      case 4:
        return (
          <Step4Adaptive
            projectType={questionnaireData.projectType}
            adaptiveAnswers={questionnaireData.adaptiveAnswers}
            onUpdateAnswers={(answers) =>
              setQuestionnaireData({ ...questionnaireData, adaptiveAnswers: answers })
            }
            onNext={() => setCurrentStep(5)}
            onBack={() => setCurrentStep(3)}
          />
        );

      case 5:
        return (
          <Step5Design
            selectedStyle={questionnaireData.designPreferences.style}
            colors={questionnaireData.designPreferences.colors || ''}
            customStyle={questionnaireData.designPreferences.customStyle || ''}
            onSelectStyle={(style) =>
              setQuestionnaireData({
                ...questionnaireData,
                designPreferences: { ...questionnaireData.designPreferences, style },
              })
            }
            onColorsChange={(colors) =>
              setQuestionnaireData({
                ...questionnaireData,
                designPreferences: { ...questionnaireData.designPreferences, colors },
              })
            }
            onCustomStyleChange={(customStyle) =>
              setQuestionnaireData({
                ...questionnaireData,
                designPreferences: { ...questionnaireData.designPreferences, customStyle },
              })
            }
            onNext={handleGenerate}
            onBack={() => setCurrentStep(4)}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-[600px] bg-slate-900 rounded-2xl shadow-2xl border border-slate-800 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
        >
          <X className="text-gray-400" size={20} />
        </button>

        {renderProgressBar()}

        {error && (
          <div className="mx-8 mb-4 p-3 bg-red-500/10 border border-red-500 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}

        {renderContent()}
      </div>
    </div>
  );
};
