import React from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import BlogPost from '../components/BlogPost';

function BlogPage() {
  // 从 Context 获取需要的数据和状态喵~
  const { blogPosts, isLoadingPosts, errorLoadingPosts } = useApp();

  // 只有在加载完成且没有错误时才排序喵~
  const sortedPosts = !isLoadingPosts && !errorLoadingPosts
    ? [...blogPosts].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    : [];

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-black">主人的日记喵~ 📝</h1>
        <Link to="/blog/new">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
            写新日记~
          </button>
        </Link>
      </div>

      {/* 加载状态 */}
      {isLoadingPosts && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg animate-pulse">正在加载日记喵... (ฅ^•ﻌ•^ฅ)</p>
        </div>
      )}

      {/* 错误状态 */}
      {!isLoadingPosts && errorLoadingPosts && (
         <div className="text-center py-12 bg-red-100 border border-red-400 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">喵呜! 出错了!</strong>
          <span className="block sm:inline"> 获取日记失败: {errorLoadingPosts} T_T</span>
        </div>
      )}

      {/* 成功加载，但没有帖子 */}
      {!isLoadingPosts && !errorLoadingPosts && sortedPosts.length === 0 && (
        <div className="text-center py-12">
           <p className="text-gray-500 text-lg">还没有日记呢，主人快来写点什么吧喵！( Φ ω Φ )</p>
        </div>
      )}

      {/* 成功加载，显示帖子 */}
      {!isLoadingPosts && !errorLoadingPosts && sortedPosts.length > 0 && (
        <div className="space-y-6">
          {sortedPosts.map(post => (
            <BlogPost key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}

export default BlogPage; 