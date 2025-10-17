// Step 3: Core Features

import React from 'react';
import { Plus, X } from 'lucide-react';

interface Step3Props {
  features: string[];
  onUpdateFeatures: (features: string[]) => void;
  onNext: () => void;
  onBack: () => void;
}

export const Step3Features: React.FC<Step3Props> = ({
  features,
  onUpdateFeatures,
  onNext,
  onBack,
}) => {
  const canProceed = features.filter((f) => f.trim() !== '').length >= 2;

  const handleFeatureChange = (index: number, value: string) => {
    const newFeatures = [...features];
    newFeatures[index] = value;
    onUpdateFeatures(newFeatures);
  };

  const handleAddFeature = () => {
    if (features.length < 5) {
      onUpdateFeatures([...features, '']);
    }
  };

  const handleRemoveFeature = (index: number) => {
    if (features.length > 2) {
      const newFeatures = features.filter((_, i) => i !== index);
      onUpdateFeatures(newFeatures);
    }
  };

  return (
    <div className="p-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">Core Features</h2>
        <p className="text-gray-400">List 2-5 main features or actions</p>
        <p className="text-sm text-gray-500 mt-2">
          Focus on core actions, not every feature
        </p>
      </div>

      <div className="space-y-3 mb-6">
        {features.map((feature, index) => (
          <div key={index} className="flex gap-2">
            <input
              type="text"
              value={feature}
              onChange={(e) => handleFeatureChange(index, e.target.value)}
              placeholder={`Feature ${index + 1}`}
              className="flex-1 px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {features.length > 2 && (
              <button
                onClick={() => handleRemoveFeature(index)}
                className="p-3 bg-slate-700 text-gray-400 rounded-lg hover:bg-slate-600 hover:text-white transition-all"
                type="button"
              >
                <X size={20} />
              </button>
            )}
          </div>
        ))}
      </div>

      {features.length < 5 && (
        <button
          onClick={handleAddFeature}
          className="w-full py-3 px-4 mb-6 bg-slate-800 border border-slate-700 text-gray-300 rounded-lg hover:bg-slate-700 hover:border-slate-600 transition-all flex items-center justify-center gap-2"
          type="button"
        >
          <Plus size={20} />
          Add Another Feature
        </button>
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
