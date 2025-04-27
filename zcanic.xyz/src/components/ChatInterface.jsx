import React, { useState, useEffect } from 'react';
import { getChatCompletion } from '../services/openai';
import SettingsPanel from './SettingsPanel';
import MessageList from './MessageList';
import ChatInput from './ChatInput';
import { useApp } from '../context/AppContext';
import { Settings, MessageSquare, Trash2 } from 'lucide-react';

function ChatInterface() {
  const { 
    messages, addMessage, clearChatHistory, 
    initialSettings, saveNonSensitiveSettings
  } = useApp(); 

  // Local state now only needs to hold non-sensitive settings
  const [currentSettings, setCurrentSettings] = useState(() => {
    const defaults = {
      model: 'deepseek-ai/DeepSeek-R1',
      temperature: 0.7,
      maxTokens: 2000,
      systemPrompt: ''
    };
    // Merge defaults with initialSettings from context (if available)
    return { ...defaults, ...(initialSettings || {}) }; 
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Effect to synchronize local state when context settings change
  useEffect(() => {
    if (initialSettings) {
      // initialSettings from context already excludes apiBase if AppProvider is correct
      setCurrentSettings(initialSettings);
    }
  }, [initialSettings]);

  const handleSaveSettingsPanel = (newSettingsFromPanel) => {
    // newSettingsFromPanel no longer contains apiBase
    setCurrentSettings(newSettingsFromPanel);
    saveNonSensitiveSettings(newSettingsFromPanel); // Save non-sensitive parts
    setIsSettingsOpen(false);
  };

  const handleSend = async (userInput) => {
    if (!userInput.trim() || isLoading) return;

    // No API Key check needed here
    
    const newUserMessage = { role: 'user', content: userInput };
    addMessage(newUserMessage);
    setIsLoading(true);

    try {
      // Prepare messages to send (including system prompt if set)
      const currentMessages = [...messages, newUserMessage]; 
      const messagesToSend = [
        ...(currentSettings.systemPrompt.trim() ? [{ role: 'system', content: currentSettings.systemPrompt }] : []),
        ...currentMessages.filter(msg => msg.role === 'user' || msg.role === 'assistant')
      ];
      
      // Call backend proxy (no apiKey needed)
      const completion = await getChatCompletion(
          messagesToSend, 
          currentSettings.model, 
          currentSettings.temperature,
          currentSettings.maxTokens 
      );
      
      if (completion) {
        addMessage({ role: 'assistant', content: completion });
      } else {
        throw new Error('Backend returned an empty completion.喵?'); 
      }
    } catch (error) {
      console.error('Error sending message via backend proxy:', error);
      addMessage({ role: 'system', content: `喵呜！发送消息时出错 T_T: ${error.message}` });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    if (window.confirm('Are you sure you want to clear the entire chat history?')) {
       clearChatHistory();
       addMessage({ role: 'system', content: 'Chat history cleared.' });
    }
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900 shadow-lg rounded-lg overflow-hidden">
      {/* Header with Settings/Clear */}
      <div className="flex justify-between items-center p-3 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">和 Zcanic 聊天喵</h2>
        <div className="flex items-center space-x-2">
          <button onClick={handleClearChat} title="Clear Chat" className="p-2 rounded-md text-gray-500 hover:bg-red-100 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 transition-colors duration-150 dark:text-gray-400 dark:hover:bg-red-900 dark:hover:text-red-300 dark:focus:ring-red-700">
            <Trash2 className="w-5 h-5" />
          </button>
          <button onClick={() => setIsSettingsOpen(true)} title="Settings" className="p-2 rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors duration-150 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-200 dark:focus:ring-blue-700">
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Message List */}
      <MessageList messages={messages} />

      {/* Loading Indicator */}
      {isLoading && (
        <div className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400 italic">
          Zcanic 正在打字喵...
        </div>
      )}

      {/* Input Area */}
      <ChatInput onSend={handleSend} disabled={isLoading} />

      {/* Settings Panel - No longer pass apiKeyError */}
      <SettingsPanel
        isVisible={isSettingsOpen} 
        settings={currentSettings} 
        onSettingsChange={handleSaveSettingsPanel} 
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
}

export default ChatInterface; 