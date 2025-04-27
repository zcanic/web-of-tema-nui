import React, { useState } from 'react';

function ChatInput({ onSend, isLoading }) {
  const [input, setInput] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSend(input.trim());
      setInput('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200 bg-white dark:bg-gray-800">
      <div className="flex space-x-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="和 zcanic 说点什么喵..."
          className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-gray-100 dark:bg-gray-700 disabled:opacity-50"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-blue-700 dark:hover:bg-blue-800"
        >
          {isLoading ? '发送中...' : '发送'}
        </button>
      </div>
    </form>
  );
}

export default ChatInput; 