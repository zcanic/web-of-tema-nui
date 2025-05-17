"""
API 路由模块
"""
import time
import httpx
from typing import Dict, Any, List, Optional

from fastapi import APIRouter, Depends, HTTPException, Header, Request, Response
from fastapi.responses import FileResponse
from starlette import status

from voice_app.api.models import (
    TTSRequest, 
    TTSResponse, 
    TranslateRequest,
    TranslateResponse,
    SpeakersResponse,
    HealthResponse
)
from voice_app.services.tts_service import TTSService
from voice_app.utils.config import get_config


router = APIRouter()
tts_service = TTSService()


# 身份验证依赖
async def verify_api_key(
    x_api_key: Optional[str] = Header(None)
) -> None:
    """
    验证API密钥中间件
    
    Args:
        x_api_key: HTTP头中的API密钥
    
    Raises:
        HTTPException: 如果API密钥无效
    """
    config = get_config()
    api_key = config.get("server", {}).get("api_key", "")
    
    # 如果未配置API密钥，则不进行验证
    if not api_key:
        return
    
    # 验证API密钥
    if not x_api_key or x_api_key != api_key:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid API Key",
            headers={"WWW-Authenticate": "ApiKey"},
        )


@router.post("/tts", response_model=TTSResponse, dependencies=[Depends(verify_api_key)])
async def text_to_speech(request: TTSRequest) -> TTSResponse:
    """
    将中文文本转换为日语语音
    
    Args:
        request: TTS请求模型
    
    Returns:
        TTSResponse: TTS响应模型
    """
    result = await tts_service.text_to_speech(
        text=request.text,
        speaker_id=request.speaker_id,
        message_id=request.message_id,
        bypass_cache=request.bypass_cache
    )
    
    return result


@router.post("/translate", response_model=TranslateResponse, dependencies=[Depends(verify_api_key)])
async def translate_to_japanese(request: TranslateRequest) -> TranslateResponse:
    """
    将中文文本翻译为日语
    
    Args:
        request: 翻译请求模型
    
    Returns:
        TranslateResponse: 翻译响应模型
    """
    start_time = time.time()
    
    try:
        translated_text = await tts_service._get_translated_text(
            text=request.text,
            message_id=request.message_id,
            bypass_cache=request.bypass_cache
        )
        
        duration_ms = int((time.time() - start_time) * 1000)
        
        if not translated_text:
            return TranslateResponse(
                success=False,
                message="翻译失败",
                translated_text="",
                duration_ms=duration_ms
            )
        
        return TranslateResponse(
            success=True,
            message="OK",
            translated_text=translated_text,
            duration_ms=duration_ms
        )
    
    except Exception as e:
        duration_ms = int((time.time() - start_time) * 1000)
        return TranslateResponse(
            success=False,
            message=f"处理失败: {str(e)}",
            translated_text="",
            duration_ms=duration_ms
        )


@router.get("/speakers", response_model=SpeakersResponse, dependencies=[Depends(verify_api_key)])
async def get_speakers() -> SpeakersResponse:
    """
    获取所有可用的语音说话人
    
    Returns:
        SpeakersResponse: 说话人列表响应模型
    """
    try:
        speakers = await tts_service.get_voice_speakers()
        return SpeakersResponse(
            success=True,
            message="OK",
            speakers=speakers
        )
    except Exception as e:
        return SpeakersResponse(
            success=False,
            message=f"获取说话人列表失败: {str(e)}",
            speakers=[]
        )


@router.get("/audio/{filename}", dependencies=[Depends(verify_api_key)])
async def get_audio_file(filename: str) -> FileResponse:
    """
    获取音频文件
    
    Args:
        filename: 文件名
    
    Returns:
        FileResponse: 音频文件响应
    """
    config = get_config()
    audio_storage_path = config.get("server", {}).get("audio_storage_path", "./audio_storage")
    file_path = f"{audio_storage_path}/{filename}"
    
    try:
        return FileResponse(
            path=file_path,
            media_type="audio/wav",  # 或根据文件扩展名动态设置
            filename=filename
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Audio file not found: {str(e)}"
        )


@router.get("/health", response_model=HealthResponse)
async def health_check() -> HealthResponse:
    """
    健康检查端点
    
    Returns:
        HealthResponse: 健康状态响应
    """
    # 检查voicevox引擎是否在线
    voicevox_status = False
    try:
        config = get_config()
        voicevox_url = config.get("voicevox", {}).get("engine_url", "http://localhost:50021")
        
        async with httpx.AsyncClient(timeout=2.0) as client:
            response = await client.get(f"{voicevox_url}/version")
            if response.status_code == 200:
                voicevox_status = True
    except:
        pass
    
    # 服务版本
    version = "0.1.0"
    
    return HealthResponse(
        status="healthy",
        version=version,
        components={
            "voicevox_engine": voicevox_status
        }
    ) 