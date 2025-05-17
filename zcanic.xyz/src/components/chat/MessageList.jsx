import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { MessageSquare } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

/**
 * 消息列表组件 - 使用现代几何风格与磨砂玻璃效果
 */
function MessageList({ messages, isLoading, containerRef }) {
  const messagesEndRef = useRef(null);
  const prevMessagesCountRef = useRef(messages.length);
  
  // 滚动到最新消息 - 只在新消息添加时才滚动
  useEffect(() => {
    // 只有在消息增加时才滚动到底部
    if (messages.length > prevMessagesCountRef.current && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
    
    prevMessagesCountRef.current = messages.length;
  }, [messages.length]);
  
  // 基于消息的颜色和背景
  const getMessageStyles = (role, status) => {
    // 处理中的消息使用特殊样式
    if (status === 'pending' || status === 'processing') {
      return {
        container: 'justify-start',
        bubble: 'bg-white/60 dark:bg-slate-700/60 backdrop-blur-sm text-slate-500 dark:text-slate-400 rounded-2xl rounded-tl-sm shadow-sm border border-slate-200/50 dark:border-slate-600/30',
      };
    }
    
    switch (role) {
      case 'user':
        return {
          container: 'justify-end',
          bubble: 'bg-indigo-500/90 text-white backdrop-blur-sm rounded-2xl rounded-tr-sm shadow-md border border-indigo-400/30',
        };
      case 'assistant':
        return {
          container: 'justify-start',
          bubble: 'bg-white/80 dark:bg-slate-700/80 backdrop-blur-sm text-slate-900 dark:text-white rounded-2xl rounded-tl-sm shadow-md border border-slate-200/50 dark:border-slate-600/30',
        };
      case 'system':
        return {
          container: 'justify-center',
          bubble: 'bg-slate-100/80 dark:bg-slate-800/80 backdrop-blur-sm text-slate-700 dark:text-slate-300 rounded-xl shadow-sm border border-slate-200/50 dark:border-slate-700/30',
        };
      default:
        return {
          container: 'justify-start',
          bubble: 'bg-white/80 dark:bg-slate-700/80 backdrop-blur-sm text-slate-900 dark:text-white rounded-2xl rounded-tl-sm shadow-md border border-slate-200/50 dark:border-slate-600/30',
        };
    }
  };

  // 处理消息内容的渲染，添加加载动画
  const renderMessageContent = (message) => {
    if (message.status === 'pending' || message.status === 'processing') {
      return (
        <div className="flex items-center">
          <span>{message.content}</span>
          <div className="ml-2 flex space-x-1">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="w-1.5 h-1.5 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce"
                style={{ animationDelay: `${i * 0.1}s` }}
              />
            ))}
          </div>
        </div>
      );
    }
    
    // 检查消息内容是否包含Markdown语法或思考标签
    const hasMarkdown = /(\*\*|__|~~|```|\[.*\]\(.*\)|#+ |>|<think>|💭|\*思考过程|\`)/g.test(message.content);
    
    if (hasMarkdown) {
      // 使用ReactMarkdown渲染含有Markdown的内容
      return (
        <div className="markdown-content prose dark:prose-invert prose-sm sm:prose-base max-w-none">
          <ReactMarkdown 
            remarkPlugins={[remarkGfm]}
            components={{
              // 自定义代码块样式
              code({node, inline, className, children, ...props}) {
                const match = /language-(\w+)/.exec(className || '');
                return !inline ? (
                  <div className="code-block-wrapper my-3 rounded-md overflow-hidden">
                    <div className="code-block-header bg-slate-700 px-4 py-1 text-xs text-slate-300">
                      {match ? match[1] : 'code'}
                    </div>
                    <pre className="bg-slate-800 p-4 rounded-t-none rounded-b-md overflow-auto">
                      <code className={className} {...props}>
                        {children}
                      </code>
                    </pre>
                  </div>
                ) : (
                  <code className="bg-slate-200 dark:bg-slate-700 px-1 py-0.5 rounded text-sm" {...props}>
                    {children}
                  </code>
                );
              },
              // 自定义思考过程块样式
              p(props) {
                const text = props.children?.toString() || '';
                if (text.startsWith('💭') || text.includes('*思考过程*')) {
                  return (
                    <div className="thinking-block bg-indigo-50 dark:bg-indigo-900/30 border-l-4 border-indigo-400 dark:border-indigo-600 p-3 my-3 rounded">
                      {props.children}
                    </div>
                  );
                }
                return <p {...props} />;
              }
            }}
          >
            {message.content}
          </ReactMarkdown>
        </div>
      );
    }
    
    // 处理普通文本消息，为每个段落添加margin
    return message.content.split('\n').map((paragraph, i) => (
      <p key={i} className={i > 0 ? 'mt-2' : ''}>
        {paragraph}
      </p>
    ));
  };
  
  return (
    <div className="space-y-3 sm:space-y-5 w-full">
      {messages.length === 0 ? (
        <div className="flex justify-center items-center min-h-[40vh] sm:min-h-[50vh]">
          <div className="text-center p-4 sm:p-6 bg-white/30 dark:bg-slate-700/30 rounded-xl backdrop-blur-md">
            <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-xl flex items-center justify-center shadow-md">
              <MessageSquare className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
            </div>
            <h3 className="text-base sm:text-lg font-medium text-slate-800 dark:text-slate-200 mb-2">开始一次对话</h3>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">输入您的问题，Zcanic 将帮助您找到答案。</p>
          </div>
        </div>
      ) : (
        messages.map((message, index) => {
          const styles = getMessageStyles(message.role, message.status);
          
          return (
            <div 
              key={message.id || index}
              className={`flex ${styles.container}`}
            >
              <div className={`${message.role === 'system' ? 'max-w-[95%] sm:max-w-[90%] mx-auto' : message.role === 'user' ? 'max-w-[85%] sm:max-w-[95%] ml-auto' : 'max-w-[85%] sm:max-w-[95%]'}`}>
                <div 
                  className={`px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base ${styles.bubble} ${
                    (message.status === 'pending' || message.status === 'processing') ? 'animate-pulse' : ''
                  }`}
                >
                  {renderMessageContent(message)}
                </div>
              </div>
            </div>
          );
        })
      )}
      <div ref={messagesEndRef} className="h-4" /> {/* Add extra space at bottom for better scrolling */}
    </div>
  );
}

MessageList.propTypes = {
  messages: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string,
      role: PropTypes.oneOf(['user', 'assistant', 'system']).isRequired,
      content: PropTypes.string.isRequired,
      status: PropTypes.oneOf(['pending', 'processing', 'completed', 'failed'])
    })
  ).isRequired,
  isLoading: PropTypes.bool,
  containerRef: PropTypes.object
};

MessageList.defaultProps = {
  isLoading: false
};

export default MessageList; 