import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/cjs/styles/prism';

export default function Chatbox() {
  const { settings, chatHistory, addMessage } = useApp();
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = {
      role: 'user',
      content: input,
      timestamp: new Date().toISOString(),
    };

    addMessage(userMessage);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch(`${settings.baseApi}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${settings.apiKey}`,
        },
        body: JSON.stringify({
          model: settings.model,
          messages: [
            { role: 'system', content: settings.systemPrompt },
            ...chatHistory.map(msg => ({ role: msg.role, content: msg.content })),
            { role: 'user', content: input },
          ],
          stream: false,
        }),
      });

      const data = await response.json();
      const aiMessage = {
        role: 'assistant',
        content: data.choices[0].message.content,
        timestamp: new Date().toISOString(),
      };

      addMessage(aiMessage);
    } catch (error) {
      console.error('Error:', error);
      addMessage({
        role: 'assistant',
        content: 'Sorry, there was an error processing your request.',
        timestamp: new Date().toISOString(),
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section id="chat" className="py-20 px-4">
      <div className="container mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="clay-card p-6"
        >
          <div className="h-[60vh] overflow-y-auto mb-6 space-y-4">
            <AnimatePresence>
              {chatHistory.map((message, index) => (
                <motion.div
                  key={message.timestamp}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl p-4 ${
                      message.role === 'user'
                        ? 'bg-clay-300 text-clay-800'
                        : 'bg-clay-100 text-clay-800'
                    }`}
                  >
                    <ReactMarkdown
                      components={{
                        code({ node, inline, className, children, ...props }) {
                          const match = /language-(\w+)/.exec(className || '');
                          return !inline && match ? (
                            <SyntaxHighlighter
                              style={vscDarkPlus}
                              language={match[1]}
                              PreTag="div"
                              {...props}
                            >
                              {String(children).replace(/\n$/, '')}
                            </SyntaxHighlighter>
                          ) : (
                            <code className={className} {...props}>
                              {children}
                            </code>
                          );
                        },
                      }}
                    >
                      {message.content}
                    </ReactMarkdown>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSubmit} className="flex gap-4">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 clay-button bg-transparent"
              disabled={isLoading}
            />
            <motion.button
              type="submit"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="clay-button"
              disabled={isLoading}
            >
              {isLoading ? '...' : 'Send'}
            </motion.button>
          </form>
        </motion.div>
      </div>
    </section>
  );
} 