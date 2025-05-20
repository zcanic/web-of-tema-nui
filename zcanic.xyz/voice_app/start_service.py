#!/usr/bin/env python
"""
Zcanic Voice Service Windows启动脚本
适用于Windows系统的简化启动方式
"""
import os
import sys
import uvicorn
from pathlib import Path

# 将项目根目录添加到Python路径
project_root = Path(__file__).parent.parent.absolute()
sys.path.append(str(project_root))

# 导入必要的模块
from voice_app.utils.config import get_config

def main():
    """启动语音服务"""
    try:
        # 获取配置
        config = get_config()
        server_config = config.get("server", {})
        
        # 获取服务器配置
        host = server_config.get("host", "0.0.0.0")
        port = int(server_config.get("port", 8000))
        debug = server_config.get("debug", False)
        
        print(f"🚀 启动Zcanic语音服务 - http://{host}:{port}")
        print("按Ctrl+C停止服务")
        
        # 启动服务器
        uvicorn.run(
            "voice_app.main:app", 
            host=host, 
            port=port, 
            reload=debug
        )
        
    except Exception as e:
        print(f"❌ 启动服务失败: {str(e)}")
        return 1
        
    return 0

if __name__ == "__main__":
    sys.exit(main()) 