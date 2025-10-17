// Main modal container that orchestrates the entire flow with 6-step questionnaire

import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { AuthForm } from './AuthForm';
import { Step1ProjectType } from './Step1ProjectType';
import { Step2Audience } from './Step2Audience';
import { Step3PainPoints } from './Step3PainPoints';
import { Step4Description } from './Step4Description';
import { Step5Adaptive } from './Step5Adaptive';
import { Step6Design } from './Step6Design';
import { PromptPreview } from './PromptPreview';
import { LoadingScreen } from './LoadingScreen';
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
  const [isApiComplete, setIsApiComplete] = useState(false);
  const [generatedPrompt, setGeneratedPrompt] = useState('');
  const [generationId, setGenerationId] = useState('');

  const [questionnaireData, setQuestionnaireData] = useState<QuestionnaireData>({
    projectType: '',
    customProjectType: '',
    targetAudience: '',
    painPoints: '',
    projectDescription: '',
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
    setIsApiComplete(false);
    setError('');

    try {
      // Start timing for minimum display duration (prevent jarring flashes)
      const startTime = Date.now();
      const minLoadingTime = 2000; // 2 seconds minimum

      // Make the actual API call
      const response = await apiClient.generatePrompt(questionnaireData);

      // Calculate how much time has elapsed
      const elapsedTime = Date.now() - startTime;
      const remainingTime = minLoadingTime - elapsedTime;

      // If we need to wait longer to meet minimum display time, do so
      if (remainingTime > 0) {
        await new Promise(resolve => setTimeout(resolve, remainingTime));
      }

      // Signal to LoadingScreen that API is complete
      setIsApiComplete(true);

      // Wait for completion animation (500ms + small buffer)
      await new Promise(resolve => setTimeout(resolve, 800));

      // Now we can safely show the results
      setGeneratedPrompt(response.prompt);
      setGenerationId(response.generationId);
      setCurrentStep('preview');
      setIsGenerating(false);
    } catch (err: any) {
      handleError(err.message || 'Failed to generate prompt');
      setIsGenerating(false);
      setIsApiComplete(false);
    }
  };

  const handleReset = () => {
    setCurrentStep(1);
    setQuestionnaireData({
      projectType: '',
      customProjectType: '',
      targetAudience: '',
      painPoints: '',
      projectDescription: '',
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

    const progress = (currentStep / 6) * 100;

    return (
      <div className="px-8 pt-6 pb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-400">Step {currentStep} of 6</span>
          <span className="text-sm text-gray-400">{Math.round(progress)}%</span>
        </div>
        <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
          <div
            className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 h-2 rounded-full transition-all duration-500 ease-out"
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
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
        </div>
      );
    }

    if (!user) {
      return <AuthForm onAuthenticated={handleAuthenticated} onError={handleError} />;
    }

    if (isGenerating) {
      return <LoadingScreen onComplete={isApiComplete} />;
    }

    if (currentStep === 'preview') {
      return (
        <PromptPreview
          prompt={generatedPrompt}
          generationId={generationId}
          questionnaireData={questionnaireData}
          onBack={() => setCurrentStep(6)}
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
            targetAudience={questionnaireData.targetAudience}
            onAudienceChange={(audience) =>
              setQuestionnaireData({ ...questionnaireData, targetAudience: audience })
            }
            onNext={() => setCurrentStep(3)}
            onBack={() => setCurrentStep(1)}
          />
        );

      case 3:
        return (
          <Step3PainPoints
            painPoints={questionnaireData.painPoints}
            onPainPointsChange={(painPoints) =>
              setQuestionnaireData({ ...questionnaireData, painPoints })
            }
            onNext={() => setCurrentStep(4)}
            onBack={() => setCurrentStep(2)}
          />
        );

      case 4:
        return (
          <Step4Description
            projectDescription={questionnaireData.projectDescription}
            onDescriptionChange={(description) =>
              setQuestionnaireData({ ...questionnaireData, projectDescription: description })
            }
            onNext={() => setCurrentStep(5)}
            onBack={() => setCurrentStep(3)}
          />
        );

      case 5:
        return (
          <Step5Adaptive
            projectType={questionnaireData.projectType}
            adaptiveAnswers={questionnaireData.adaptiveAnswers}
            onUpdateAnswers={(answers) =>
              setQuestionnaireData({ ...questionnaireData, adaptiveAnswers: answers })
            }
            onNext={() => setCurrentStep(6)}
            onBack={() => setCurrentStep(4)}
          />
        );

      case 6:
        return (
          <Step6Design
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
            onBack={() => setCurrentStep(5)}
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
