"""
Voicevox语音生成服务
负责与Voicevox Engine交互，生成语音
"""
import json
import time
import uuid
from typing import Dict, Any, Optional, Tuple, Union, BinaryIO
import os
from pathlib import Path
import httpx
from loguru import logger

from voice_app.utils.config import get_config


class VoicevoxService:
    """
    Voicevox语音合成服务类
    """
    
    def __init__(self):
        """初始化Voicevox服务"""
        self.config = get_config().get("voicevox", {})
        self.engine_url = self.config.get("engine_url", "http://localhost:50021")
        self.timeout = self.config.get("timeout_seconds", 30)
        self.default_speaker_id = self.config.get("default_speaker_id", 46)
        
        # 音频参数配置
        self.audio_params = self.config.get("audio_parameters", {})
        self.speed_scale = self.audio_params.get("speed_scale", 1.0)
        self.pitch_scale = self.audio_params.get("pitch_scale", 0.0)
        self.intonation_scale = self.audio_params.get("intonation_scale", 1.0)
        self.volume_scale = self.audio_params.get("volume_scale", 1.0)
        
        # 输出格式
        self.output_format = self.config.get("output_format", "wav").lower()
        
        # 音频存储路径
        self.server_config = get_config().get("server", {})
        self.audio_storage_path = self.server_config.get("audio_storage_path", "./audio_storage")
        
        # 确保存储目录存在
        os.makedirs(self.audio_storage_path, exist_ok=True)
        
        logger.info(f"Voicevox服务初始化完成，引擎地址: {self.engine_url}")
    
    async def get_speakers(self) -> list:
        """
        获取可用的说话人列表
        
        Returns:
            list: 说话人列表
        """
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.get(f"{self.engine_url}/speakers")
                response.raise_for_status()
                return response.json()
        except Exception as e:
            logger.error(f"获取说话人列表失败: {str(e)}")
            return []
    
    async def generate_audio(
        self, 
        text: str, 
        speaker_id: Optional[int] = None,
        message_id: Optional[str] = None
    ) -> Tuple[Optional[bytes], Optional[str]]:
        """
        生成语音音频
        
        Args:
            text: 要转换为语音的文本
            speaker_id: 说话人ID，不提供则使用默认值
            message_id: 消息ID，用于日志
            
        Returns:
            Tuple[Optional[bytes], Optional[str]]: 
                - 音频数据
                - 存储路径（相对路径）
        """
        if not text:
            logger.warning(f"收到空文本进行语音合成 [message_id={message_id}]")
            return None, None
            
        # 使用默认说话人ID
        speaker_id = speaker_id or self.default_speaker_id
        
        try:
            start_time = time.time()
            logger.info(f"开始生成语音 [message_id={message_id}] 文本长度: {len(text)} speaker_id: {speaker_id}")
            
            # 第一步: 生成Audio Query
            query_params = {
                "text": text,
                "speaker": speaker_id
            }
            
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                query_response = await client.post(
                    f"{self.engine_url}/audio_query",
                    params=query_params
                )
                query_response.raise_for_status()
                query_data = query_response.json()
                
                # 应用自定义参数
                query_data["speedScale"] = self.speed_scale
                query_data["pitchScale"] = self.pitch_scale
                query_data["intonationScale"] = self.intonation_scale
                query_data["volumeScale"] = self.volume_scale
                
                # 第二步: 合成语音
                synthesis_params = {
                    "speaker": speaker_id
                }
                
                synthesis_response = await client.post(
                    f"{self.engine_url}/synthesis",
                    params=synthesis_params,
                    json=query_data
                )
                synthesis_response.raise_for_status()
                
                # 获取音频数据
                audio_data = synthesis_response.content
                
                # 存储音频文件
                filename = f"zcanic_voice_{message_id or uuid.uuid4().hex}.{self.output_format}"
                file_path = os.path.join(self.audio_storage_path, filename)
                
                with open(file_path, "wb") as f:
                    f.write(audio_data)
                
                relative_path = os.path.join("audio_storage", filename)
                
                elapsed_time = time.time() - start_time
                logger.info(
                    f"语音生成完成 [message_id={message_id}] "
                    f"耗时: {elapsed_time:.2f}秒, "
                    f"文件大小: {len(audio_data)/1024:.2f}KB, "
                    f"保存路径: {file_path}"
                )
                
                return audio_data, relative_path
                
        except Exception as e:
            logger.error(f"语音生成失败 [message_id={message_id}] 错误: {str(e)}")
            return None, None
    
    def get_audio_url(self, relative_path: str) -> str:
        """
        获取音频文件的URL
        
        Args:
            relative_path: 音频文件的相对路径
            
        Returns:
            str: 音频文件的URL
        """
        # 假设服务在根路径提供静态文件访问
        return f"/{relative_path}" 