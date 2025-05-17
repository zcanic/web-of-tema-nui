"""
Zcanic Voice Service - 主应用入口
"""
import os
import sys
import uvicorn
from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from loguru import logger

from voice_app.utils.config import get_config
from voice_app.utils.logger import setup_logger
from voice_app.api.routes import router as api_router


def create_app() -> FastAPI:
    """
    创建FastAPI应用
    
    Returns:
        FastAPI: 配置好的FastAPI应用
    """
    # 加载配置
    config = get_config()
    server_config = config.get("server", {})
    
    # 创建FastAPI应用
    app = FastAPI(
        title="Zcanic Voice Service",
        description="中文文本到日语语音转换服务，集成翻译和Voicevox语音合成",
        version="0.1.0",
        docs_url="/docs",
        redoc_url="/redoc",
    )
    
    # 配置CORS
    cors_origins = server_config.get("cors_origins", ["*"])
    app.add_middleware(
        CORSMiddleware,
        allow_origins=cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    
    # 注册API路由
    app.include_router(api_router, prefix="/api")
    
    # 配置静态文件服务
    audio_storage_path = server_config.get("audio_storage_path", "./audio_storage")
    os.makedirs(audio_storage_path, exist_ok=True)
    app.mount("/audio_storage", StaticFiles(directory=audio_storage_path), name="audio_storage")
    
    # 请求日志中间件
    @app.middleware("http")
    async def log_requests(request: Request, call_next):
        start_time = logger.time()
        response = await call_next(request)
        
        # 计算处理时间
        process_time = logger.time() - start_time
        formatted_process_time = f"{process_time:.2f}ms"
        
        # 记录请求
        logger.info(
            f"{request.method} {request.url.path} "
            f"- {response.status_code} - {formatted_process_time}"
        )
        
        return response
    
    return app


# 主应用实例
app = create_app()


@app.on_event("startup")
async def startup_event():
    """应用启动时执行"""
    # 初始化日志
    setup_logger()
    logger.info("🚀 Zcanic Voice Service 启动")


@app.on_event("shutdown")
async def shutdown_event():
    """应用关闭时执行"""
    logger.info("👋 Zcanic Voice Service 关闭")


# 主页
@app.get("/")
async def root():
    """服务根路径"""
    return {
        "name": "Zcanic Voice Service",
        "description": "中文文本到日语语音转换服务",
        "version": "0.1.0",
        "docs": "/docs",
    }


# 直接运行服务器
if __name__ == "__main__":
    config = get_config()
    server_config = config.get("server", {})
    
    # 获取服务器配置
    host = server_config.get("host", "0.0.0.0")
    port = int(server_config.get("port", 8000))
    debug = server_config.get("debug", False)
    
    # 启动服务器
    uvicorn.run("voice_app.main:app", host=host, port=port, reload=debug) 