import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PlusCircle, Trash2, MessageSquare, Edit2, Check, X, ChevronLeft } from 'lucide-react';
import { deleteChatSession } from '../../services/api';
import { Button } from '../ui';

const ChatSessionsList = ({ 
  sessions, 
  setSessions, 
  onSelectSession, 
  onCreateSession, 
  currentSessionId 
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [newSessionTitle, setNewSessionTitle] = useState('');
  const [editingSessionId, setEditingSessionId] = useState(null);
  const [editedTitle, setEditedTitle] = useState('');

  // 创建新会话
  const handleCreateSession = async () => {
    if (isCreating) {
      const title = newSessionTitle.trim() || null; // 如果为空则使用默认标题
      const newSession = await onCreateSession(title);
      if (newSession) {
        setIsCreating(false);
        setNewSessionTitle('');
      }
    } else {
      setIsCreating(true);
    }
  };

  // 取消创建新会话
  const handleCancelCreate = () => {
    setIsCreating(false);
    setNewSessionTitle('');
  };

  // 开始编辑会话标题
  const handleStartEdit = (session) => {
    setEditingSessionId(session.id);
    setEditedTitle(session.title);
  };

  // 保存编辑的会话标题
  const handleSaveEdit = (sessionId) => {
    if (editedTitle.trim()) {
      setSessions(prev => prev.map(session => 
        session.id === sessionId 
          ? { ...session, title: editedTitle.trim() } 
          : session
      ));
    }
    setEditingSessionId(null);
  };

  // 取消编辑会话标题
  const handleCancelEdit = () => {
    setEditingSessionId(null);
  };

  // 删除会话
  const handleDeleteSession = async (sessionId) => {
    if (window.confirm('确定要删除这个会话吗？所有消息都将被删除。')) {
      try {
        await deleteChatSession(sessionId);
        setSessions(prev => prev.filter(session => session.id !== sessionId));
        
        // 如果删除的是当前会话，选择另一个会话
        if (sessionId === currentSessionId && sessions.length > 1) {
          const otherSession = sessions.find(s => s.id !== sessionId);
          if (otherSession) {
            onSelectSession(otherSession.id);
          }
        }
      } catch (err) {
        console.error('删除会话失败:', err);
      }
    }
  };

  // 时间格式化
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('zh-CN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // 移动设备关闭按钮 - 实际在父组件中处理
  const handleClose = () => {
    // 仅做占位，实际功能在父组件中的 backdrop 点击事件中处理
    document.dispatchEvent(new CustomEvent('closeChatSidebar'));
  };

  // 是否是移动设备
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl overflow-hidden shadow-md border border-slate-200 dark:border-slate-700 h-full flex flex-col">
      <div className="p-3 sm:p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
        <div className="flex items-center">
          {isMobile && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="mr-2 text-slate-500 md:hidden"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
          )}
          <h2 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white">聊天会话</h2>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleCreateSession}
          className="text-indigo-500 hover:text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 p-1.5 sm:p-2"
        >
          <PlusCircle className="w-5 h-5" />
        </Button>
      </div>
      
      <div className="overflow-y-auto flex-grow p-2">
        <AnimatePresence>
          {isCreating && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-2 p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg"
            >
              <input
                type="text"
                value={newSessionTitle}
                onChange={e => setNewSessionTitle(e.target.value)}
                placeholder="新会话标题..."
                className="w-full p-2 mb-2 rounded border border-indigo-200 dark:border-indigo-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm"
                autoFocus
              />
              <div className="flex justify-end space-x-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleCancelCreate}
                  className="text-slate-500 py-1 px-2 text-xs sm:text-sm"
                >
                  <X className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1" />
                  取消
                </Button>
                <Button 
                  variant="default" 
                  size="sm" 
                  onClick={handleCreateSession}
                  className="py-1 px-2 text-xs sm:text-sm"
                >
                  <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1" />
                  创建
                </Button>
              </div>
            </motion.div>
          )}
          
          {sessions.map(session => (
            <motion.div
              key={session.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className={`mb-1 p-2 sm:p-3 rounded-lg cursor-pointer transition-colors ${
                currentSessionId === session.id 
                  ? 'bg-indigo-100 dark:bg-indigo-900/40 border-l-4 border-indigo-500' 
                  : 'hover:bg-slate-100 dark:hover:bg-slate-700/50'
              }`}
              onClick={() => editingSessionId !== session.id && onSelectSession(session.id)}
            >
              <div className="flex justify-between items-start">
                <div className="flex items-start space-x-2 flex-grow overflow-hidden">
                  <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5 mt-1 text-indigo-500 dark:text-indigo-400 flex-shrink-0" />
                  
                  {editingSessionId === session.id ? (
                    <input
                      type="text"
                      value={editedTitle}
                      onChange={e => setEditedTitle(e.target.value)}
                      className="flex-grow p-1 text-sm rounded border border-indigo-200 dark:border-indigo-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      autoFocus
                      onClick={e => e.stopPropagation()}
                    />
                  ) : (
                    <div className="flex-grow overflow-hidden">
                      <div className="font-medium text-sm sm:text-base text-slate-900 dark:text-white truncate">
                        {session.title}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        {formatDate(session.updatedAt)}
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="flex ml-1 sm:ml-2 space-x-1">
                  {editingSessionId === session.id ? (
                    <>
                      <Button 
                        variant="ghost" 
                        size="xs" 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCancelEdit();
                        }}
                        className="text-slate-500 p-1"
                      >
                        <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="xs" 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSaveEdit(session.id);
                        }}
                        className="text-green-500 p-1"
                      >
                        <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button 
                        variant="ghost" 
                        size="xs" 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStartEdit(session);
                        }}
                        className="text-slate-500 hover:text-indigo-500 hover:bg-slate-100 dark:hover:bg-slate-700 p-1"
                      >
                        <Edit2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="xs" 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteSession(session.id);
                        }}
                        className="text-slate-500 hover:text-red-500 hover:bg-slate-100 dark:hover:bg-slate-700 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
          
          {sessions.length === 0 && !isCreating && (
            <div className="p-4 text-center text-slate-500 dark:text-slate-400 text-sm">
              没有聊天会话，点击上方"+"按钮创建
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ChatSessionsList; 