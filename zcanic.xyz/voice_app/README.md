# Zcanic Voice Service

中文文本到日语语音转换服务，整合 AI 翻译和 Voicevox 语音合成引擎。

## 功能特点

- ✅ 中文到日语的高质量翻译 (使用 OpenAI API)
- ✅ 日语语音合成 (使用 Voicevox 引擎)
- ✅ 简单易用的 RESTful API
- ✅ 内置缓存系统提高性能和减少资源消耗
- ✅ 灵活配置 (YAML 文件 + 环境变量)
- ✅ 完整的日志系统

## 系统要求

- Python 3.8+
- Voicevox Engine (需要单独安装)
- OpenAI API 密钥 (用于翻译)

## 安装

1. 克隆仓库：

```bash
git clone https://github.com/your-username/zcanic-voice-service.git
cd zcanic-voice-service
```

2. 安装依赖：

```bash
pip install -r voice_app/requirements.txt
```

3. 配置服务：

   - 复制示例环境变量文件：
     ```bash
     cp voice_app/config.example.env .env
     ```
   - 编辑`.env`文件，填入 OpenAI API 密钥和其他设置
   - (可选) 创建`voice_app/config/config_local.yaml`自定义配置

## 启动服务

### 方法 1: 使用命令行脚本

```bash
python run_voice_service.py
```

可用参数：

- `--host`: 指定服务器主机地址 (默认: 0.0.0.0)
- `--port`: 指定服务器端口 (默认: 8000)
- `--debug`: 启用调试模式 (代码修改自动重启)
- `--config`: 指定自定义配置文件路径

例如：

```bash
python run_voice_service.py --port 9000 --debug
```

### 方法 2: 使用 Python 模块

```bash
cd voice_app
python -m uvicorn main:app
```

## API 使用说明

### 1. 文本到语音 (TTS)

将中文文本转换为日语语音。

**请求：**

```http
POST /api/tts
Content-Type: application/json

{
  "text": "你好，我是一只可爱的猫娘",
  "speaker_id": 46,
  "message_id": "user_message_123",
  "bypass_cache": false
}
```

**响应：**

```json
{
  "success": true,
  "message": "OK",
  "audio_url": "/audio_storage/zcanic_voice_user_message_123.wav",
  "translated_text": "こんにちは、私は可愛いネコ娘ですにゃ～",
  "duration_ms": 1523
}
```

### 2. 翻译服务

仅执行中文到日语的翻译。

**请求：**

```http
POST /api/translate
Content-Type: application/json

{
  "text": "你好，世界！",
  "message_id": "translate_123",
  "bypass_cache": false
}
```

**响应：**

```json
{
  "success": true,
  "message": "OK",
  "translated_text": "こんにちは、世界！",
  "duration_ms": 857
}
```

### 3. 获取可用说话人

获取 Voicevox 引擎支持的所有说话人列表。

**请求：**

```http
GET /api/speakers
```

### 4. 获取音频文件

**请求：**

```http
GET /api/audio/{filename}
```

## 配置选项

主要配置选项包括：

| 配置项            | 环境变量            | 描述                   | 默认值                    |
| ----------------- | ------------------- | ---------------------- | ------------------------- |
| 服务器主机        | SERVER_HOST         | 服务器主机地址         | 0.0.0.0                   |
| 服务器端口        | SERVER_PORT         | 服务器监听端口         | 8000                      |
| API 密钥          | API_KEY             | API 访问密钥           | (无)                      |
| AI API 基础 URL   | AI_API_BASE         | OpenAI API 基础 URL    | https://api.openai.com/v1 |
| AI API 密钥       | AI_API_KEY          | OpenAI API 密钥        | (必填)                    |
| AI 模型           | AI_MODEL            | 用于翻译的 OpenAI 模型 | gpt-3.5-turbo             |
| Voicevox 引擎 URL | VOICEVOX_ENGINE_URL | Voicevox 引擎 API 地址 | http://localhost:50021    |
| 默认说话人 ID     | VOICEVOX_SPEAKER_ID | 默认使用的说话人 ID    | 46                        |
| 日志级别          | LOG_LEVEL           | 日志记录级别           | INFO                      |

## 与前端集成

前端可以通过以下流程集成语音功能：

1. 调用`/api/tts`接口发送中文文本
2. 接收响应中的`audio_url`
3. 创建音频元素并播放：
   ```javascript
   const audioEl = new Audio(`http://your-server-url${response.audio_url}`);
   audioEl.play();
   ```

## 开发

### 项目结构

```
voice_app/
├── api/                # API相关代码
│   ├── models.py       # 请求/响应模型
│   └── routes.py       # API路由
├── config/             # 配置文件
│   └── default_config.yaml
├── services/           # 核心服务
│   ├── translator.py   # 翻译服务
│   ├── voicevox.py     # Voicevox集成
│   └── tts_service.py  # TTS服务协调器
├── utils/              # 工具函数
│   ├── config.py       # 配置管理
│   └── logger.py       # 日志配置
├── main.py             # 应用入口
└── run_service.py      # 命令行入口
```
