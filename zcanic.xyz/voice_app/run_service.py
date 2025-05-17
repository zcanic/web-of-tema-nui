#!/usr/bin/env python
"""
Zcanic Voice Service 启动脚本
用于从命令行方便地运行语音服务
"""
import os
import sys
import argparse
import uvicorn


def main():
    """命令行入口函数"""
    parser = argparse.ArgumentParser(description="Zcanic Voice Service CLI")
    
    # 添加命令行参数
    parser.add_argument(
        "--host", 
        type=str, 
        default=None, 
        help="服务器主机地址 (默认使用配置文件中的设置)"
    )
    parser.add_argument(
        "--port", 
        type=int, 
        default=None, 
        help="服务器端口 (默认使用配置文件中的设置)"
    )
    parser.add_argument(
        "--debug", 
        action="store_true", 
        help="开启调试模式 (自动重载)"
    )
    parser.add_argument(
        "--config", 
        type=str, 
        default=None, 
        help="自定义配置文件路径"
    )
    
    # 解析命令行参数
    args = parser.parse_args()
    
    # 设置环境变量
    if args.config:
        os.environ["VOICE_CONFIG_PATH"] = args.config
    if args.host:
        os.environ["SERVER_HOST"] = args.host
    if args.port:
        os.environ["SERVER_PORT"] = str(args.port)
    if args.debug:
        os.environ["SERVER_DEBUG"] = "true"
    
    # 启动服务器
    uvicorn.run(
        "voice_app.main:app", 
        host=os.environ.get("SERVER_HOST", "0.0.0.0"),
        port=int(os.environ.get("SERVER_PORT", "8000")),
        reload=args.debug
    )


if __name__ == "__main__":
    main() 