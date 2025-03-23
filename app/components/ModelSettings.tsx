"use client";

import React from 'react';
import { ModelConfig } from '../types';

type ModelSettingsProps = {
  modelConfig: ModelConfig;
  onModelConfigChange: (config: ModelConfig) => void;
  availableModels: string[];
};

export default function ModelSettings({
  modelConfig,
  onModelConfigChange,
  availableModels,
}: ModelSettingsProps) {
  return (
    <div className="border rounded-lg p-4 mb-6">
      <h3 className="text-lg font-medium mb-4">Model Settings</h3>
      <div className="space-y-4">
        <div>
          <label htmlFor="model" className="block text-sm font-medium mb-1">
            Model
          </label>
          <select
            id="model"
            className="w-full rounded-md border border-gray-300 px-3 py-2"
            value={modelConfig.modelName}
            onChange={(e) =>
              onModelConfigChange({ ...modelConfig, modelName: e.target.value })
            }
          >
            {availableModels.map((model) => (
              <option key={model} value={model}>
                {model}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="temperature" className="block text-sm font-medium mb-1">
            Temperature: {modelConfig.temperature}
          </label>
          <input
            id="temperature"
            type="range"
            min="0"
            max="1"
            step="0.1"
            className="w-full"
            value={modelConfig.temperature}
            onChange={(e) =>
              onModelConfigChange({
                ...modelConfig,
                temperature: parseFloat(e.target.value),
              })
            }
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>Precise</span>
            <span>Creative</span>
          </div>
        </div>

        <div>
          <label htmlFor="maxTokens" className="block text-sm font-medium mb-1">
            Max Tokens: {modelConfig.maxTokens}
          </label>
          <input
            id="maxTokens"
            type="range"
            min="256"
            max="4096"
            step="256"
            className="w-full"
            value={modelConfig.maxTokens}
            onChange={(e) =>
              onModelConfigChange({
                ...modelConfig,
                maxTokens: parseInt(e.target.value),
              })
            }
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>Short</span>
            <span>Long</span>
          </div>
        </div>
      </div>
    </div>
  );
} 