"""
翻译服务模块
使用OpenAI API将中文文本翻译为日语
"""
import time
import json
from typing import Dict, Any, Optional, List
import httpx
from loguru import logger
from openai import OpenAI
from openai.types.chat import ChatCompletion

from voice_app.utils.config import get_config


class TranslatorService:
    """
    翻译服务类，使用OpenAI API将中文文本翻译为日语
    """
    
    def __init__(self):
        """初始化翻译服务"""
        self.config = get_config().get("ai", {})
        self.api_base = self.config.get("api_base", "https://api.openai.com/v1")
        self.api_key = self.config.get("api_key", "")
        self.model = self.config.get("model", "gpt-3.5-turbo")
        self.temperature = self.config.get("temperature", 0.3)
        self.max_tokens = self.config.get("max_tokens", 1000)
        self.system_prompt = self.config.get("system_prompt", "")
        self.timeout = self.config.get("timeout_seconds", 30)
        self.max_retries = self.config.get("max_retries", 2)
        
        if not self.api_key:
            logger.warning("未设置AI API密钥，翻译功能可能无法正常工作")
        
        # 初始化OpenAI客户端
        self.client = OpenAI(
            api_key=self.api_key,
            base_url=self.api_base,
            timeout=httpx.Timeout(self.timeout)
        )
        
        logger.info(f"翻译服务初始化完成，使用模型: {self.model}")
    
    async def translate_to_japanese(
        self, 
        text: str, 
        message_id: Optional[str] = None
    ) -> str:
        """
        将中文文本翻译为日语
        
        Args:
            text: 要翻译的中文文本
            message_id: 消息ID，用于日志
            
        Returns:
            str: 翻译后的日语文本
        """
        if not text:
            logger.warning(f"收到空文本进行翻译 [message_id={message_id}]")
            return ""
            
        logger.info(f"开始翻译文本 [message_id={message_id}] 文本长度: {len(text)}")
        
        # 重试机制
        retries = 0
        while retries <= self.max_retries:
            try:
                start_time = time.time()
                
                # 准备消息
                messages = [
                    {"role": "system", "content": self.system_prompt},
                    {"role": "user", "content": text}
                ]
                
                # 调用OpenAI API进行翻译
                response: ChatCompletion = self.client.chat.completions.create(
                    model=self.model,
                    messages=messages,
                    temperature=self.temperature,
                    max_tokens=self.max_tokens
                )
                
                # 获取翻译结果
                translated_text = response.choices[0].message.content
                
                elapsed_time = time.time() - start_time
                logger.info(
                    f"翻译完成 [message_id={message_id}] "
                    f"耗时: {elapsed_time:.2f}秒, "
                    f"原文长度: {len(text)}, "
                    f"译文长度: {len(translated_text)}"
                )
                
                return translated_text
                
            except Exception as e:
                retries += 1
                logger.error(
                    f"翻译失败 [message_id={message_id}] "
                    f"重试次数: {retries}/{self.max_retries} "
                    f"错误: {str(e)}"
                )
                
                if retries > self.max_retries:
                    logger.error(f"翻译重试次数达到上限，放弃翻译 [message_id={message_id}]")
                    raise Exception(f"翻译失败: {str(e)}")
                
                # 指数退避重试
                time.sleep(2 ** retries)
        
        # 如果重试后仍然失败，返回空字符串
        return "" 