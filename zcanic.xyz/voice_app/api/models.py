"""
API 请求和响应数据模型
"""
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field


class TTSRequest(BaseModel):
    """
    TTS请求模型
    """
    text: str = Field(..., description="要转换为语音的中文文本")
    speaker_id: Optional[int] = Field(None, description="说话人ID (不提供则使用默认值)")
    message_id: Optional[str] = Field(None, description="消息ID，用于日志和缓存")
    bypass_cache: Optional[bool] = Field(False, description="是否绕过缓存")


class TTSResponse(BaseModel):
    """
    TTS响应模型
    """
    success: bool = Field(..., description="是否成功")
    message: str = Field(..., description="状态消息")
    audio_url: Optional[str] = Field(None, description="音频文件URL")
    translated_text: str = Field("", description="翻译后的日语文本")
    duration_ms: int = Field(..., description="处理耗时(毫秒)")


class TranslateRequest(BaseModel):
    """
    翻译请求模型
    """
    text: str = Field(..., description="要翻译的中文文本")
    message_id: Optional[str] = Field(None, description="消息ID，用于日志")
    bypass_cache: Optional[bool] = Field(False, description="是否绕过缓存")


class TranslateResponse(BaseModel):
    """
    翻译响应模型
    """
    success: bool = Field(..., description="是否成功")
    message: str = Field(..., description="状态消息")
    translated_text: str = Field("", description="翻译后的日语文本")
    duration_ms: int = Field(..., description="处理耗时(毫秒)")


class SpeakerInfo(BaseModel):
    """
    说话人信息模型
    """
    id: int = Field(..., description="说话人ID")
    name: str = Field(..., description="说话人名称")
    styles: List[Dict[str, Any]] = Field(..., description="说话人样式列表")


class SpeakersResponse(BaseModel):
    """
    说话人列表响应模型
    """
    success: bool = Field(..., description="是否成功")
    message: str = Field(..., description="状态消息")
    speakers: List[Dict[str, Any]] = Field(..., description="说话人列表")
    
    
class HealthResponse(BaseModel):
    """
    健康检查响应模型
    """
    status: str = Field(..., description="服务状态")
    version: str = Field(..., description="服务版本")
    components: Dict[str, bool] = Field(..., description="组件状态") 