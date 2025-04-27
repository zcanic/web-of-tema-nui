import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm'; // 导入 GFM 插件
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useApp } from '../context/AppContext'; // Import useApp

function BlogPost({ post }) {
  const { deleteBlogPost } = useApp(); // Get delete function from context
  const [isDeleting, setIsDeleting] = useState(false); // 删除状态喵~
  const [deleteError, setDeleteError] = useState(null); // 删除错误喵~

  const formattedDate = new Date(post.timestamp).toLocaleDateString('zh-CN', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric', 
    hour: '2-digit', 
    minute: '2-digit' 
  });

  const handleDelete = async () => { // 改成 async 函数喵~
    if (window.confirm('确定要删除这篇日记吗喵？')) {
      setIsDeleting(true);
      setDeleteError(null); // 清除旧错误
      try {
        // deleteBlogPost 返回 Promise，我们 await 它
        await deleteBlogPost(post.id);
        // 如果成功，组件会被父组件移除，所以这里不需要做什么喵~
        // console.log("删除成功喵！");
      } catch (error) {
        console.error("删除博客时出错喵:", error);
        setDeleteError(error.message || '删除失败了喵 T_T');
        setIsDeleting(false); // 出错时才需要重置状态，允许重试
      }
      // 成功时不需要 setIsDeleting(false) 因为组件会消失
    }
  };

  // 更新按钮样式，加入禁用状态
  const responsiveButtonStyle = `ml-2 px-2 py-1 text-xs sm:text-sm rounded border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed`;

  return (
    <article className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 transition hover:shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">{post.title}</h2>
      
      {/* Conditionally render image if imageUrl exists */}
      {post.imageUrl && (
        <div className="mb-4">
          <img 
            src={post.imageUrl} 
            alt={`Image for ${post.title}`} 
            className="max-w-full h-auto rounded-md border mx-auto dark:border-gray-600" // Center image, limit width
          />
        </div>
      )}

      <div className="prose dark:prose-invert max-w-none prose-sm sm:prose-base text-gray-900 dark:text-gray-200">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]} // 启用 GFM (表格, 删除线等)
          components={{
            // 自定义代码块渲染
            code({ node, inline, className, children, ...props }) {
              const match = /language-(\w+)/.exec(className || '');
              return !inline && match ? (
                <SyntaxHighlighter
                  style={vscDarkPlus}
                  language={match[1]}
                  PreTag="div"
                  className="rounded-md" // 给代码块加圆角
                  {...props}
                >
                  {String(children).replace(/\n$/, '')}
                </SyntaxHighlighter>
              ) : (
                // 行内代码样式
                <code className={`bg-gray-100 dark:bg-gray-700 text-red-600 dark:text-red-400 px-1 rounded ${className}`} {...props}>
                  {children}
                </code>
              );
            },
            // 自定义链接样式
            a: ({node, ...props}) => <a className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline" {...props} />, 
            // 自定义列表样式
            ul: ({node, ...props}) => <ul className="list-disc list-inside" {...props} />, 
            ol: ({node, ...props}) => <ol className="list-decimal list-inside" {...props} />,
          }}
        >
          {post.content}
        </ReactMarkdown>
      </div>

      <div className="text-sm text-gray-500 dark:text-gray-400 flex justify-between items-center mt-4">
        <span>{formattedDate}</span>
        <div className="flex items-center"> {/* 包裹按钮和错误信息 */}
          {deleteError && <span className="text-xs text-red-500 dark:text-red-400 mr-2">{deleteError}</span>}
          <button
            onClick={handleDelete}
            className={responsiveButtonStyle}
            disabled={isDeleting} // 禁用按钮
          >
            {isDeleting ? '删除中...' : '删除'} {/* 改变按钮文字 */}
          </button>
        </div>
      </div>
    </article>
  );
}

export default BlogPost; 