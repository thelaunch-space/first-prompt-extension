// Step 6: Design & Vibe Selection with enhanced premium UI

import React from 'react';
import { Palette } from 'lucide-react';
import { DesignStyleOption } from '../types';

interface Step6Props {
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

export const Step6Design: React.FC<Step6Props> = ({
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
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 bg-pink-500/10 rounded-lg">
            <Palette className="text-pink-400" size={24} />
          </div>
          <h2 className="text-2xl font-bold text-white">Design & Vibe</h2>
        </div>
        <p className="text-gray-400">Choose a visual direction for your project</p>
      </div>

      <div className="space-y-3 mb-6">
        {DESIGN_STYLES.map((style) => (
          <button
            key={style.value}
            onClick={() => onSelectStyle(style.value)}
            className={`w-full p-4 rounded-xl border-2 text-left transition-all duration-300 ${
              selectedStyle === style.value
                ? 'border-pink-500 bg-gradient-to-r from-pink-500/10 to-purple-500/10 shadow-lg shadow-pink-500/20'
                : 'border-slate-700 bg-slate-800/50 hover:border-slate-600 hover:bg-slate-800 hover:shadow-md hover:scale-[1.01]'
            }`}
          >
            <div className={`font-semibold transition-colors ${
              selectedStyle === style.value ? 'text-white' : 'text-gray-300'
            }`}>
              {style.label}
            </div>
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
          className="w-full px-4 py-3 bg-slate-800 border-2 border-slate-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 focus:shadow-lg focus:shadow-pink-500/10 transition-all duration-300"
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
          className="w-full px-4 py-3 bg-slate-800 border-2 border-slate-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 focus:shadow-lg focus:shadow-pink-500/10 min-h-[80px] resize-none transition-all duration-300"
        />
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
          disabled={!selectedStyle}
          className="flex-1 py-3 px-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-purple-700 hover:shadow-lg hover:shadow-purple-500/30 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none"
        >
          Generate Prompt
        </button>
      </div>
    </div>
  );
};
