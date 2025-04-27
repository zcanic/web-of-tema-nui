import React, { useEffect, useRef } from 'react';
import Message from './Message';

function MessageList({ messages }) {
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map((message, index) => (
        <Message
          key={index}
          role={message.role}
          content={message.content}
        />
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
}

export default MessageList; 