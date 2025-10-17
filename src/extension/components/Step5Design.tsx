// Step 5: Design & Vibe Selection

import React from 'react';
import { DesignStyleOption } from '../types';

interface Step5Props {
  selectedStyle: string;
  colors: string;
  customStyle: string;
  onSelectStyle: (style: string) => void;
  onColorsChange: (colors: string) => void;
  onCustomStyleChange: (style: string) => void;
  onNext: () => void;
  onBack: () => void;
}

const DESIGN_STYLES: DesignStyleOption[] = [
  { value: 'modern', label: 'Modern Minimal', description: 'Clean, spacious, sophisticated' },
  { value: 'colorful', label: 'Creative Colorful', description: 'Bold, vibrant, energetic' },
  { value: 'corporate', label: 'Corporate Professional', description: 'Trustworthy, formal, polished' },
  { value: 'dark', label: 'Dark Mode', description: 'Sleek, modern, easy on eyes' },
];

export const Step5Design: React.FC<Step5Props> = ({
  selectedStyle,
  colors,
  customStyle,
  onSelectStyle,
  onColorsChange,
  onCustomStyleChange,
  onNext,
  onBack,
}) => {
  return (
    <div className="p-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">Design & Vibe</h2>
        <p className="text-gray-400">Choose a visual direction</p>
      </div>

      <div className="space-y-3 mb-6">
        {DESIGN_STYLES.map((style) => (
          <button
            key={style.value}
            onClick={() => onSelectStyle(style.value)}
            className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
              selectedStyle === style.value
                ? 'border-blue-500 bg-blue-500/10'
                : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
            }`}
          >
            <div className="text-white font-medium">{style.label}</div>
            <div className="text-sm text-gray-400 mt-1">{style.description}</div>
          </button>
        ))}
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Color preferences (optional)
        </label>
        <input
          type="text"
          value={colors}
          onChange={(e) => onColorsChange(e.target.value)}
          placeholder="E.g., Blue and white, Brand colors: #FF5733"
          className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Additional style notes (optional)
        </label>
        <textarea
          value={customStyle}
          onChange={(e) => onCustomStyleChange(e.target.value)}
          placeholder="E.g., Inspired by Stripe's design, with rounded corners and soft shadows"
          className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[80px] resize-none"
        />
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
          disabled={!selectedStyle}
          className="flex-1 py-3 px-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium rounded-lg hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Generate Prompt
        </button>
      </div>
    </div>
  );
};
