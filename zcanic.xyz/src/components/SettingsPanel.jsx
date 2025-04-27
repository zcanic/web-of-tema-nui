import React, { useState, useEffect } from 'react';

// Define default settings structure used in this component
const defaultPanelSettings = {
  model: 'deepseek-ai/DeepSeek-R1',
  temperature: 0.7,
  maxTokens: 2000,
  systemPrompt: ''
};

function SettingsPanel({
  settings,
  onSettingsChange,
  isVisible,
  onClose,
}) {
  // Initialize internal state by merging passed settings with defaults
  // Ensures tempSettings always has the expected shape, even if props.settings is initially incomplete
  const [tempSettings, setTempSettings] = useState(() => ({
    ...defaultPanelSettings,
    ...(settings || {}), // Merge prop settings if they exist
  }));
  
  // Initialize isMaxTokensInfinite based on the *initial* merged state
  const [isMaxTokensInfinite, setIsMaxTokensInfinite] = useState(tempSettings.maxTokens === null);

  // Effect to re-synchronize internal state if the *prop* settings change externally
  useEffect(() => {
    if (isVisible && settings) { // Only update if visible and settings prop is valid
      // Merge again to ensure we have defaults for any potentially missing keys in settings prop
      const { apiKey, ...restSettings } = settings; // Exclude apiKey when syncing
      const mergedSettings = { ...defaultPanelSettings, ...restSettings };
      setTempSettings(mergedSettings);
      setIsMaxTokensInfinite(mergedSettings.maxTokens === null);
    }
  }, [isVisible, settings]); // Dependencies: isVisible and the settings prop itself

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name === 'isMaxTokensInfinite') {
      const isInfinite = checked;
      setIsMaxTokensInfinite(isInfinite);
      // Update maxTokens in tempSettings based on checkbox
      setTempSettings(prev => ({
        ...prev,
        // If setting to infinite, set null. If unchecking, restore previous value or default.
        maxTokens: isInfinite ? null : (prev.maxTokens === null ? defaultPanelSettings.maxTokens : prev.maxTokens) 
      }));
    } else if (name === 'apiBase') {
      // This input is removed, so this case shouldn't be hit, but keep else structure
      // Optionally remove this else-if entirely
    } else {
      let processedValue = value;
      if (type === 'number' && name === 'maxTokens') { // Handle maxTokens specifically
          processedValue = value === '' ? '' : parseInt(value, 10);
          // Prevent negative or zero values, default to something sensible if invalid
          if (processedValue !== '' && (isNaN(processedValue) || processedValue <= 0)) {
              processedValue = defaultPanelSettings.maxTokens; 
          }
      } else if (type === 'number') {
        processedValue = value === '' ? '' : parseInt(value, 10);
      } else if (type === 'range') {
        processedValue = parseFloat(value);
      }
      setTempSettings(prev => ({ ...prev, [name]: processedValue }));
      // If user types in maxTokens, uncheck infinite
      if (name === 'maxTokens') {
        setIsMaxTokensInfinite(false);
      }
    }
  };

  const handleSave = () => {
    // Final validation before saving
    const { apiKey, ...settingsToSave } = { ...tempSettings }; // Exclude apiKey
    if (isMaxTokensInfinite || settingsToSave.maxTokens === '') { // Treat empty string as infinite too
      settingsToSave.maxTokens = null;
    } else {
      const mt = parseInt(settingsToSave.maxTokens, 10);
      // If somehow still invalid, default to null (infinite) or a standard value
      settingsToSave.maxTokens = isNaN(mt) || mt <= 0 ? null : mt; 
    }
    
    console.log('[SettingsPanel] Calling onSettingsChange with:', settingsToSave);
    onSettingsChange(settingsToSave);
    onClose();
  };

  if (!isVisible) return null;

  // Use optional chaining and nullish coalescing for safer access in render
  const displayTemp = tempSettings?.temperature ?? defaultPanelSettings.temperature;
  const displayMaxTokens = tempSettings?.maxTokens ?? ''; // Use empty string for input value if null/undefined

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 dark:bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-lg shadow-xl dark:shadow-lg max-h-[90vh] overflow-y-auto dark:border dark:border-gray-700">
        <div className="flex justify-between items-center mb-4 sticky top-0 bg-white dark:bg-gray-800 pt-1 pb-3 border-b dark:border-gray-600">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">设置喵</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-200">
             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>
        
        <div className="space-y-4">
          <div>
            <label htmlFor="model" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Model</label>
            <input
              type="text"
              name="model"
              value={tempSettings?.model ?? ''}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
              placeholder="e.g., deepseek-ai/DeepSeek-R1"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="temperature" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Temperature: {displayTemp.toFixed(1)}</label>
              <input
                type="range"
                name="temperature"
                min="0"
                max="1"
                step="0.1"
                value={displayTemp}
                onChange={handleInputChange}
                className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer"
              />
            </div>
            <div>
              <label htmlFor="maxTokens" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Max Tokens: {isMaxTokensInfinite ? 'Infinite' : displayMaxTokens}</label>
              <div className="flex items-center mt-1">
                <input
                  type="number"
                  name="maxTokens"
                  value={isMaxTokensInfinite ? '' : displayMaxTokens}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100 ${isMaxTokensInfinite ? 'bg-gray-100 dark:bg-gray-600 opacity-70 dark:opacity-70' : ''}`}
                  min="1"
                  step="1"
                  placeholder={isMaxTokensInfinite ? 'Infinite' : 'e.g., 2000'}
                  disabled={isMaxTokensInfinite}
                />
                <div className="flex items-center ml-2">
                  <input
                    type="checkbox"
                    id="isMaxTokensInfinite"
                    name="isMaxTokensInfinite"
                    checked={isMaxTokensInfinite}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 border-gray-300 dark:border-gray-500 rounded focus:ring-blue-500 dark:focus:ring-offset-gray-800"
                  />
                  <label htmlFor="isMaxTokensInfinite" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
                    Infinite
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="systemPrompt" className="block text-sm font-medium text-gray-700 dark:text-gray-300">System Prompt</label>
            <textarea
              name="systemPrompt"
              value={tempSettings?.systemPrompt ?? ''}
              onChange={handleInputChange}
              rows={8}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm dark:bg-gray-700 dark:text-gray-100"
              placeholder="Enter the system prompt..."
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end space-x-3 sticky bottom-0 bg-white dark:bg-gray-800 pt-3 pb-1 border-t dark:border-gray-600">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-gray-600 dark:text-gray-200 dark:border-gray-500 dark:hover:bg-gray-500 dark:focus:ring-offset-gray-800"
          >
            取消喵
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:hover:bg-blue-500 dark:focus:ring-offset-gray-800"
          >
            保存喵
          </button>
        </div>
      </div>
    </div>
  );
}

export default SettingsPanel; 