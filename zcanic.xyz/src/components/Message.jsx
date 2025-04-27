import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

function Message({ role, content }) {
  const isUser = role === 'user';
  const isAssistant = role === 'assistant';
  const isSystem = role === 'system';

  const bubbleColor = isUser
    ? 'bg-blue-600 dark:bg-blue-700'
    : isAssistant
    ? 'bg-white dark:bg-gray-700'
    : 'bg-yellow-100 dark:bg-yellow-800';

  const textColor = isUser
    ? 'text-white'
    : isAssistant
    ? 'text-gray-900 dark:text-gray-100'
    : 'text-yellow-800 dark:text-yellow-200';

  const containerClasses = `flex mb-3 ${isUser ? 'justify-end' : isSystem ? 'justify-center' : 'justify-start'}`;
  const bubbleClasses = `px-4 py-2 rounded-lg max-w-xs sm:max-w-md md:max-w-lg lg:max-w-xl break-words shadow-sm ${bubbleColor} ${isUser ? 'rounded-br-none' : isAssistant ? 'rounded-bl-none' : ''}`;
  const proseClasses = `prose prose-sm max-w-none ${isAssistant ? 'dark:prose-invert' : ''} ${textColor}`;

  const components = {
    code({ node, inline, className, children, ...props }) {
      const match = /language-(\w+)/.exec(className || '');
      return !inline && match ? (
        <SyntaxHighlighter
          style={vscDarkPlus}
          language={match[1]}
          PreTag="div"
          className="!bg-gray-800 rounded-md my-2 text-sm shadow-inner"
          customStyle={{ margin: '0', padding: '0.8em' }}
          {...props}
        >
          {String(children).replace(/\n$/, '')}
        </SyntaxHighlighter>
      ) : (
        <code className={`bg-gray-100 dark:bg-gray-600 text-red-600 dark:text-red-300 px-1 rounded text-xs font-mono ${className}`} {...props}>
          {children}
        </code>
      );
    },
    a: ({ node, ...props }) => <a className={`hover:opacity-80 underline ${textColor === 'text-white' ? 'text-blue-200' : 'text-blue-600 dark:text-blue-400' }`} {...props} />,
    p: ({node, ...props}) => <p className="mb-2 last:mb-0" {...props} />,
  };

  return (
    <div className={containerClasses}>
      <div className={bubbleClasses}>
        {isSystem ? (
          <p className={`text-xs italic ${textColor}`}>{content}</p>
        ) : (
          <div className={proseClasses}>
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={components}
            >
              {content}
            </ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
}

export default Message; 