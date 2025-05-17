"""
TTS服务模块
将翻译和语音合成服务整合到一起，提供完整的中文文本到日语语音的转换服务
"""
import time
import asyncio
import os
from typing import Dict, Any, Optional, Tuple

from loguru import logger
from voice_app.utils.config import get_config
from voice_app.services.translator import TranslatorService
from voice_app.services.voicevox import VoicevoxService


class TTSService:
    """
    文本到语音服务类
    """
    
    def __init__(self):
        """初始化TTS服务"""
        # 加载配置
        self.config = get_config()
        
        # 初始化翻译服务
        self.translator = TranslatorService()
        
        # 初始化语音合成服务
        self.voicevox = VoicevoxService()
        
        # 缓存配置
        self.server_config = self.config.get("server", {})
        self.enable_cache = self.server_config.get("enable_cache", True)
        self.cache_expiry_hours = self.server_config.get("cache_expiry_hours", 24)
        
        # 内存缓存
        self._translation_cache = {}
        self._audio_cache = {}
        
        logger.info("TTS服务初始化完成")
    
    async def text_to_speech(
        self, 
        text: str, 
        speaker_id: Optional[int] = None,
        message_id: Optional[str] = None,
        bypass_cache: bool = False
    ) -> Dict[str, Any]:
        """
        将中文文本转换为日语语音
        
        Args:
            text: 要转换的中文文本
            speaker_id: 说话人ID
            message_id: 消息ID，用于日志和缓存
            bypass_cache: 是否绕过缓存
            
        Returns:
            Dict[str, Any]: 包含音频URL、翻译文本等信息的字典
        """
        start_time = time.time()
        
        if not text:
            logger.warning(f"收到空文本 [message_id={message_id}]")
            return {
                "success": False,
                "message": "文本不能为空",
                "audio_url": None,
                "translated_text": "",
                "duration_ms": 0
            }
        
        try:
            # 1. 翻译中文为日语
            translated_text = await self._get_translated_text(text, message_id, bypass_cache)
            if not translated_text:
                logger.error(f"翻译失败 [message_id={message_id}]")
                return {
                    "success": False,
                    "message": "翻译失败",
                    "audio_url": None,
                    "translated_text": "",
                    "duration_ms": int((time.time() - start_time) * 1000)
                }
            
            # 2. 生成语音
            audio_data, audio_path = await self._get_audio(
                translated_text, speaker_id, message_id, bypass_cache
            )
            if not audio_data or not audio_path:
                logger.error(f"语音生成失败 [message_id={message_id}]")
                return {
                    "success": False,
                    "message": "语音生成失败",
                    "audio_url": None,
                    "translated_text": translated_text,
                    "duration_ms": int((time.time() - start_time) * 1000)
                }
            
            # 3. 返回结果
            audio_url = self.voicevox.get_audio_url(audio_path)
            
            duration_ms = int((time.time() - start_time) * 1000)
            logger.info(
                f"TTS流程完成 [message_id={message_id}] "
                f"文本长度: {len(text)}, "
                f"耗时: {duration_ms}ms"
            )
            
            return {
                "success": True,
                "message": "OK",
                "audio_url": audio_url,
                "translated_text": translated_text,
                "duration_ms": duration_ms
            }
            
        except Exception as e:
            logger.exception(f"TTS处理过程中出错 [message_id={message_id}]: {str(e)}")
            return {
                "success": False,
                "message": f"处理失败: {str(e)}",
                "audio_url": None,
                "translated_text": "",
                "duration_ms": int((time.time() - start_time) * 1000)
            }
    
    async def _get_translated_text(
        self, 
        text: str, 
        message_id: Optional[str] = None,
        bypass_cache: bool = False
    ) -> str:
        """
        获取翻译文本，支持缓存
        """
        cache_key = f"trans_{text}_{message_id or ''}"
        
        # 检查缓存
        if self.enable_cache and not bypass_cache and cache_key in self._translation_cache:
            logger.info(f"翻译缓存命中 [message_id={message_id}]")
            return self._translation_cache[cache_key]
        
        # 执行翻译
        translated_text = await self.translator.translate_to_japanese(text, message_id)
        
        # 更新缓存
        if self.enable_cache and translated_text:
            self._translation_cache[cache_key] = translated_text
            # 控制缓存大小
            if len(self._translation_cache) > 1000:  # 简单的缓存控制
                self._translation_cache.pop(next(iter(self._translation_cache)), None)
        
        return translated_text
    
    async def _get_audio(
        self,
        japanese_text: str,
        speaker_id: Optional[int] = None,
        message_id: Optional[str] = None,
        bypass_cache: bool = False
    ) -> Tuple[Optional[bytes], Optional[str]]:
        """
        获取音频数据，支持缓存
        """
        speaker_id = speaker_id or self.voicevox.default_speaker_id
        cache_key = f"audio_{japanese_text}_{speaker_id}_{message_id or ''}"
        
        # 检查缓存
        if self.enable_cache and not bypass_cache and cache_key in self._audio_cache:
            logger.info(f"音频缓存命中 [message_id={message_id}]")
            return self._audio_cache[cache_key]
        
        # 生成音频
        audio_data, audio_path = await self.voicevox.generate_audio(
            japanese_text, speaker_id, message_id
        )
        
        # 更新缓存
        if self.enable_cache and audio_data and audio_path:
            self._audio_cache[cache_key] = (audio_data, audio_path)
            # 控制缓存大小
            if len(self._audio_cache) > 200:  # 音频文件比较大，缓存少一些
                self._audio_cache.pop(next(iter(self._audio_cache)), None)
        
        return audio_data, audio_path
    
    async def get_voice_speakers(self) -> list:
        """
        获取可用的语音说话人列表
        
        Returns:
            list: 说话人列表
        """
        return await self.voicevox.get_speakers() 