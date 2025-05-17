// VoicePlayer.jsx - Zcanic Voice Service 集成示例
// 这是一个Next.js组件示例，展示如何在Zcanic.xyz前端集成语音服务

import { useState, useRef, useEffect } from 'react';

const VOICE_API_URL = process.env.NEXT_PUBLIC_VOICE_API_URL || 'http://localhost:8000';
const API_KEY = process.env.NEXT_PUBLIC_VOICE_API_KEY || '';

/**
 * 语音播放器组件
 * @param {Object} props
 * @param {string} props.text - 要转换为语音的中文文本
 * @param {number} props.speakerId - 说话人ID（默认为46）
 * @param {string} props.messageId - 消息ID，用于缓存和日志
 * @param {function} props.onStart - 语音开始播放时的回调
 * @param {function} props.onEnd - 语音播放结束时的回调
 * @param {function} props.onError - 发生错误时的回调
 */
export default function VoicePlayer({
  text,
  speakerId = 46,
  messageId = '',
  onStart = () => {},
  onEnd = () => {},
  onError = () => {}
}) {
  // 状态
  const [isLoading, setIsLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState('');
  const [translation, setTranslation] = useState('');
  const [error, setError] = useState('');
  
  // 引用
  const audioRef = useRef(null);
  
  // 播放完成处理
  useEffect(() => {
    const audioElement = audioRef.current;
    if (audioElement) {
      const handleEnded = () => {
        onEnd();
      };
      
      audioElement.addEventListener('ended', handleEnded);
      return () => {
        audioElement.removeEventListener('ended', handleEnded);
      };
    }
  }, [onEnd]);
  
  // 生成并播放语音
  const generateAndPlay = async () => {
    if (!text || isLoading) return;
    
    setIsLoading(true);
    setError('');
    
    try {
      // 准备请求
      const response = await fetch(`${VOICE_API_URL}/api/tts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(API_KEY ? { 'X-API-Key': API_KEY } : {})
        },
        body: JSON.stringify({
          text,
          speaker_id: speakerId,
          message_id: messageId || `msg-${Date.now()}`,
          bypass_cache: false
        })
      });
      
      if (!response.ok) {
        throw new Error(`API错误: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        // 更新状态
        setAudioUrl(`${VOICE_API_URL}${data.audio_url}`);
        setTranslation(data.translated_text);
        
        // 播放音频
        setTimeout(() => {
          if (audioRef.current) {
            audioRef.current.play()
              .then(() => {
                onStart();
              })
              .catch(playErr => {
                console.warn('自动播放被浏览器阻止，需要用户交互', playErr);
              });
          }
        }, 100);
      } else {
        throw new Error(data.message || 'TTS请求失败');
      }
    } catch (err) {
      console.error('语音生成错误:', err);
      setError(err.message);
      onError(err);
    } finally {
      setIsLoading(false);
    }
  };
  
  // 手动播放
  const playAudio = () => {
    if (audioRef.current && audioUrl) {
      audioRef.current.play()
        .then(() => {
          onStart();
        })
        .catch(err => {
          console.error('播放错误:', err);
          setError('播放音频失败，请检查您的浏览器设置');
          onError(err);
        });
    }
  };
  
  return (
    <div className="voice-player">
      {/* 音频元素 */}
      <audio ref={audioRef} src={audioUrl} preload="auto" />
      
      {/* 控制按钮 */}
      <div className="voice-controls">
        <button 
          onClick={audioUrl ? playAudio : generateAndPlay}
          disabled={isLoading || !text}
          className="voice-button"
        >
          {isLoading ? '生成中...' : audioUrl ? '重新播放' : '播放语音'}
        </button>
        
        {speakerId && (
          <div className="voice-speaker">说话人ID: {speakerId}</div>
        )}
      </div>
      
      {/* 翻译显示 */}
      {translation && (
        <div className="voice-translation">
          <p>日语翻译: {translation}</p>
        </div>
      )}
      
      {/* 错误信息 */}
      {error && (
        <div className="voice-error">
          错误: {error}
        </div>
      )}
      
      {/* 示例样式 */}
      <style jsx>{`
        .voice-player {
          margin: 10px 0;
        }
        
        .voice-controls {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 8px;
        }
        
        .voice-button {
          background-color: #4CAF50;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
        }
        
        .voice-button:disabled {
          background-color: #cccccc;
          cursor: not-allowed;
        }
        
        .voice-speaker {
          font-size: 12px;
          color: #666;
        }
        
        .voice-translation {
          font-size: 14px;
          margin-top: 8px;
          padding: 8px;
          background-color: #f5f5f5;
          border-radius: 4px;
        }
        
        .voice-error {
          color: #e74c3c;
          margin-top: 8px;
          font-size: 14px;
        }
      `}</style>
    </div>
  );
}

/**
 * 使用示例:
 * 
 * import VoicePlayer from '../components/VoicePlayer';
 * 
 * export default function ChatPage() {
 *   return (
 *     <div>
 *       <h1>聊天页面</h1>
 *       
 *       <div className="message">
 *         <p>这是一条消息内容</p>
 *         <VoicePlayer 
 *           text="你好，我是一只可爱的猫娘！" 
 *           speakerId={46}
 *           messageId="unique-message-id"
 *           onStart={() => console.log('开始播放')}
 *           onEnd={() => console.log('播放结束')}
 *         />
 *       </div>
 *     </div>
 *   );
 * }
 */ 