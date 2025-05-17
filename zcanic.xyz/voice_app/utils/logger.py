"""
日志配置模块
"""
import os
import sys
from pathlib import Path
from loguru import logger
from typing import Dict, Any

from voice_app.utils.config import get_config


def setup_logger() -> None:
    """
    配置日志记录器
    """
    config = get_config()
    log_config = config.get("logging", {})
    
    # 日志级别
    log_level = log_config.get("level", "INFO").upper()
    
    # 日志存储路径
    log_path = log_config.get("save_path", "./logs")
    
    # 创建日志目录
    Path(log_path).mkdir(exist_ok=True, parents=True)
    
    # 获取日志文件大小和备份数量配置
    max_file_size = log_config.get("max_file_size_mb", 10)
    backup_count = log_config.get("backup_count", 5)
    
    # 清除默认处理器
    logger.remove()
    
    # 添加控制台处理器
    logger.add(
        sys.stderr,
        level=log_level,
        format="<green>{time:YYYY-MM-DD HH:mm:ss}</green> | <level>{level: <8}</level> | <cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> - <level>{message}</level>",
        colorize=True,
        backtrace=True,
        diagnose=True,
    )
    
    # 添加文件处理器
    log_file = os.path.join(log_path, "zcanic_voice.log")
    logger.add(
        log_file,
        level=log_level,
        format="{time:YYYY-MM-DD HH:mm:ss} | {level: <8} | {name}:{function}:{line} - {message}",
        rotation=f"{max_file_size} MB",
        retention=backup_count,
        encoding="utf-8",
        backtrace=True,
        diagnose=True,
    )
    
    # 错误日志单独保存
    error_log_file = os.path.join(log_path, "zcanic_voice_error.log")
    logger.add(
        error_log_file,
        level="ERROR",
        format="{time:YYYY-MM-DD HH:mm:ss} | {level: <8} | {name}:{function}:{line} - {message}",
        rotation=f"{max_file_size} MB",
        retention=backup_count,
        encoding="utf-8",
        backtrace=True,
        diagnose=True,
    )
    
    logger.info(f"日志系统初始化完成，日志级别: {log_level}，日志存储路径: {log_path}")


def get_logger():
    """
    获取日志记录器
    
    Returns:
        logger: 配置好的日志记录器
    """
    return logger 