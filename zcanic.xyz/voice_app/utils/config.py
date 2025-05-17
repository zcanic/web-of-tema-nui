"""
配置管理模块
负责加载配置文件和环境变量
"""
import os
import pathlib
from typing import Dict, Any, Optional
import yaml
from loguru import logger
from dotenv import load_dotenv

# 项目根目录
PROJECT_ROOT = pathlib.Path(__file__).parent.parent.absolute()

# 配置文件路径
DEFAULT_CONFIG_PATH = PROJECT_ROOT / "config" / "default_config.yaml"
LOCAL_CONFIG_PATH = PROJECT_ROOT / "config" / "config_local.yaml"


def load_yaml_config(file_path: pathlib.Path) -> Dict[str, Any]:
    """
    加载YAML配置文件
    
    Args:
        file_path: YAML文件路径
        
    Returns:
        Dict[str, Any]: 配置字典
    """
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            return yaml.safe_load(f)
    except Exception as e:
        logger.error(f"加载配置文件 {file_path} 失败: {str(e)}")
        return {}


def deep_update(base_dict: Dict[str, Any], update_dict: Dict[str, Any]) -> Dict[str, Any]:
    """
    递归更新嵌套字典
    
    Args:
        base_dict: 基础字典
        update_dict: 更新字典
        
    Returns:
        Dict[str, Any]: 更新后的字典
    """
    for key, value in update_dict.items():
        if (
            key in base_dict and 
            isinstance(base_dict[key], dict) and 
            isinstance(value, dict)
        ):
            base_dict[key] = deep_update(base_dict[key], value)
        else:
            base_dict[key] = value
    return base_dict


def load_config() -> Dict[str, Any]:
    """
    加载配置，优先级: 环境变量 > 本地配置文件 > 默认配置文件
    
    Returns:
        Dict[str, Any]: 合并后的配置
    """
    # 1. 加载默认配置
    if not DEFAULT_CONFIG_PATH.exists():
        logger.error(f"默认配置文件不存在: {DEFAULT_CONFIG_PATH}")
        raise FileNotFoundError(f"默认配置文件不存在: {DEFAULT_CONFIG_PATH}")
    
    config = load_yaml_config(DEFAULT_CONFIG_PATH)
    
    # 2. 加载本地配置(如果存在)
    if LOCAL_CONFIG_PATH.exists():
        local_config = load_yaml_config(LOCAL_CONFIG_PATH)
        config = deep_update(config, local_config)
        logger.info(f"已加载本地配置文件: {LOCAL_CONFIG_PATH}")
    
    # 3. 加载环境变量
    load_dotenv()
    
    # 服务配置
    if os.getenv('SERVER_HOST'):
        config['server']['host'] = os.getenv('SERVER_HOST')
    if os.getenv('SERVER_PORT'):
        config['server']['port'] = int(os.getenv('SERVER_PORT'))
    if os.getenv('SERVER_DEBUG'):
        config['server']['debug'] = os.getenv('SERVER_DEBUG').lower() == 'true'
    if os.getenv('API_KEY'):
        config['server']['api_key'] = os.getenv('API_KEY')
    if os.getenv('AUDIO_STORAGE_PATH'):
        config['server']['audio_storage_path'] = os.getenv('AUDIO_STORAGE_PATH')
        
    # AI API配置
    if os.getenv('AI_API_BASE'):
        config['ai']['api_base'] = os.getenv('AI_API_BASE')
    if os.getenv('AI_API_KEY'):
        config['ai']['api_key'] = os.getenv('AI_API_KEY')
    if os.getenv('AI_MODEL'):
        config['ai']['model'] = os.getenv('AI_MODEL')
        
    # Voicevox配置
    if os.getenv('VOICEVOX_ENGINE_URL'):
        config['voicevox']['engine_url'] = os.getenv('VOICEVOX_ENGINE_URL')
    if os.getenv('VOICEVOX_SPEAKER_ID'):
        config['voicevox']['default_speaker_id'] = int(os.getenv('VOICEVOX_SPEAKER_ID'))
        
    # 日志配置
    if os.getenv('LOG_LEVEL'):
        config['logging']['level'] = os.getenv('LOG_LEVEL')
    if os.getenv('LOG_PATH'):
        config['logging']['save_path'] = os.getenv('LOG_PATH')
    
    return config


# 全局配置单例
_CONFIG: Optional[Dict[str, Any]] = None


def get_config() -> Dict[str, Any]:
    """
    获取配置单例
    
    Returns:
        Dict[str, Any]: 配置字典
    """
    global _CONFIG
    if _CONFIG is None:
        _CONFIG = load_config()
    return _CONFIG


def reload_config() -> Dict[str, Any]:
    """
    重新加载配置
    
    Returns:
        Dict[str, Any]: 重新加载的配置字典
    """
    global _CONFIG
    _CONFIG = load_config()
    return _CONFIG 