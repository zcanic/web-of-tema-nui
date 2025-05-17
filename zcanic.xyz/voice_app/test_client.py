#!/usr/bin/env python
"""
Zcanic Voice Service 测试客户端
用于演示和测试API功能
"""
import os
import sys
import uuid
import json
import time
import argparse
from typing import Dict, Any
import httpx


def call_tts_api(
    server_url: str,
    api_key: str,
    text: str,
    speaker_id: int = 46
) -> Dict[str, Any]:
    """
    调用TTS API将文本转换为语音
    
    Args:
        server_url: 服务器URL
        api_key: API密钥
        text: 要转换的中文文本
        speaker_id: 说话人ID
        
    Returns:
        Dict[str, Any]: API响应
    """
    message_id = uuid.uuid4().hex
    
    # 准备请求
    url = f"{server_url}/api/tts"
    headers = {
        "Content-Type": "application/json",
    }
    
    # 如果有API密钥则添加到请求头
    if api_key:
        headers["X-API-Key"] = api_key
        
    # 请求数据
    data = {
        "text": text,
        "speaker_id": speaker_id,
        "message_id": message_id,
        "bypass_cache": False
    }
    
    # 发送请求
    start_time = time.time()
    print(f"正在发送请求到 {url}...")
    print(f"文本: {text}")
    
    try:
        response = httpx.post(url, json=data, headers=headers, timeout=60.0)
        
        # 检查响应状态
        if response.status_code != 200:
            print(f"错误: HTTP状态码 {response.status_code}")
            print(f"响应: {response.text}")
            return None
            
        # 解析响应
        result = response.json()
        
        # 打印结果
        print(f"\n✅ TTS请求成功! 耗时: {time.time() - start_time:.2f}秒")
        print(f"翻译结果: {result.get('translated_text')}")
        print(f"音频URL: {result.get('audio_url')}")
        print(f"处理时间: {result.get('duration_ms')}毫秒")
        
        return result
        
    except Exception as e:
        print(f"❌ 请求失败: {str(e)}")
        return None


def get_speakers(server_url: str, api_key: str) -> Dict[str, Any]:
    """
    获取可用的语音说话人列表
    
    Args:
        server_url: 服务器URL
        api_key: API密钥
        
    Returns:
        Dict[str, Any]: API响应
    """
    # 准备请求
    url = f"{server_url}/api/speakers"
    headers = {}
    
    # 如果有API密钥则添加到请求头
    if api_key:
        headers["X-API-Key"] = api_key
        
    # 发送请求
    try:
        print(f"正在获取说话人列表...")
        
        response = httpx.get(url, headers=headers, timeout=30.0)
        
        # 检查响应状态
        if response.status_code != 200:
            print(f"错误: HTTP状态码 {response.status_code}")
            print(f"响应: {response.text}")
            return None
            
        # 解析响应
        result = response.json()
        
        # 只显示简要信息
        print("\n可用说话人列表:")
        for speaker in result.get("speakers", []):
            print(f"ID: {speaker.get('id')} - 名称: {speaker.get('name')}")
            
            # 显示风格
            styles = speaker.get("styles", [])
            if styles:
                print("  可用风格:")
                for style in styles:
                    print(f"    ID: {style.get('id')} - {style.get('name')}")
            print()
            
        return result
        
    except Exception as e:
        print(f"❌ 请求失败: {str(e)}")
        return None


def main():
    """命令行入口函数"""
    parser = argparse.ArgumentParser(description="Zcanic Voice Service 测试客户端")
    
    # 服务器配置
    parser.add_argument("--server", type=str, default="http://localhost:8000", help="服务器URL")
    parser.add_argument("--api-key", type=str, default="", help="API密钥")
    
    # 操作类型
    parser.add_argument("--list-speakers", action="store_true", help="列出所有可用的说话人")
    parser.add_argument("--text", type=str, help="要转换的中文文本")
    parser.add_argument("--speaker-id", type=int, default=46, help="说话人ID")
    
    # 解析命令行参数
    args = parser.parse_args()
    
    # 检查服务器URL
    if not args.server:
        print("错误: 必须提供服务器URL")
        return 1
        
    # 根据操作类型执行不同的功能
    if args.list_speakers:
        get_speakers(args.server, args.api_key)
    elif args.text:
        call_tts_api(args.server, args.api_key, args.text, args.speaker_id)
    else:
        # 如果没有提供操作，显示帮助
        parser.print_help()
        print("\n示例:")
        print(f"  {sys.argv[0]} --list-speakers --server http://localhost:8000")
        print(f"  {sys.argv[0]} --text \"你好，这是一段测试文本\" --speaker-id 46 --server http://localhost:8000")
        
    return 0


if __name__ == "__main__":
    sys.exit(main()) 