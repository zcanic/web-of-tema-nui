#!/usr/bin/env bash
# Zcanic Voice Service 快速部署脚本 (Windows Git Bash版本)
# 用于将语音服务从Windows开发环境部署到Linux服务器

# 设置errexit选项，任何命令失败时退出
set -e

# 彩色输出设置
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 配置参数
VOICE_SERVER_IP="123.57.182.94"
WEBSITE_SERVER_IP="8.138.47.26"
SSH_USER="root"                      # 替换为实际的SSH用户名
SSH_KEY="$HOME/.ssh/id_rsa"          # 替换为您的SSH密钥路径
REMOTE_DIR="/opt/zcanic"             # 远程服务器上的安装目录
LOCAL_DIR="$(pwd)"                   # 本地项目目录

# 显示欢迎信息
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}   Zcanic Voice Service 快速部署脚本    ${NC}"
echo -e "${BLUE}========================================${NC}"
echo -e "从 ${YELLOW}Windows Git Bash${NC} 部署到 ${GREEN}Linux服务器${NC}\n"
echo -e "语音服务器: ${GREEN}$VOICE_SERVER_IP${NC}"
echo -e "网站服务器: ${GREEN}$WEBSITE_SERVER_IP${NC}"
echo -e "远程安装目录: ${YELLOW}$REMOTE_DIR${NC}\n"

# 确认继续
read -p "确认以上配置并继续部署? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]
then
    echo -e "${RED}部署已取消${NC}"
    exit 1
fi

# 检查SSH密钥是否存在
if [ ! -f "$SSH_KEY" ]; then
    echo -e "${RED}错误: SSH密钥 $SSH_KEY 不存在${NC}"
    echo "请确保您有有效的SSH密钥用于连接服务器"
    exit 1
fi

# 检查语音服务器是否可达
echo -e "\n${YELLOW}检查语音服务器连接...${NC}"
if ! ping -c 1 $VOICE_SERVER_IP &> /dev/null; then
    echo -e "${RED}错误: 无法连接到语音服务器 $VOICE_SERVER_IP${NC}"
    exit 1
fi

echo -e "${GREEN}语音服务器可达!${NC}"

# 检查voice_app目录是否存在
if [ ! -d "$LOCAL_DIR/voice_app" ]; then
    echo -e "${RED}错误: voice_app目录不存在!${NC}"
    echo "请确保您在项目根目录中运行此脚本"
    exit 1
fi

# 创建临时目录用于准备部署文件
echo -e "\n${YELLOW}准备部署文件...${NC}"
TEMP_DIR="$LOCAL_DIR/deploy_temp"
mkdir -p "$TEMP_DIR"

# 复制需要的文件到临时目录
cp -r "$LOCAL_DIR/voice_app" "$TEMP_DIR/"
cp -f "$LOCAL_DIR/run_voice_service.py" "$TEMP_DIR/" 2>/dev/null || :
cp -f "$LOCAL_DIR/README.md" "$TEMP_DIR/" 2>/dev/null || :

# 创建部署配置文件
cat > "$TEMP_DIR/config.env" << EOL
# Zcanic Voice Service 部署配置
# 由deploy_to_server.sh自动生成

# 服务器配置
SERVER_HOST=0.0.0.0
SERVER_PORT=8000
SERVER_DEBUG=false
API_KEY=$(openssl rand -hex 16)

# AI API配置
AI_API_BASE=https://api.openai.com/v1
AI_API_KEY=your_openai_api_key_here
AI_MODEL=gpt-3.5-turbo

# Voicevox配置
VOICEVOX_ENGINE_URL=http://localhost:50021
VOICEVOX_SPEAKER_ID=46

# 路径配置
AUDIO_STORAGE_PATH=${REMOTE_DIR}/audio_storage

# 日志配置
LOG_LEVEL=INFO
LOG_PATH=${REMOTE_DIR}/logs

# CORS设置 - 允许网站服务器访问
CORS_ORIGINS=http://${WEBSITE_SERVER_IP},https://${WEBSITE_SERVER_IP}
EOL

# 创建远程安装脚本
cat > "$TEMP_DIR/remote_setup.sh" << 'EOL'
#!/bin/bash
# 远程服务器安装脚本
# 在语音服务器上执行的命令

set -e

# 获取部署目录
DEPLOY_DIR="$1"
if [ -z "$DEPLOY_DIR" ]; then
    DEPLOY_DIR="/opt/zcanic"
fi

# 彩色输出
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${YELLOW}开始在服务器上安装 Zcanic Voice Service...${NC}"

# 1. 安装系统依赖
echo -e "\n${YELLOW}安装系统依赖...${NC}"
apt-get update
apt-get install -y python3 python3-pip python3-venv build-essential libssl-dev libffi-dev python3-dev nginx

# 2. 创建项目目录
echo -e "\n${YELLOW}创建项目目录...${NC}"
mkdir -p "$DEPLOY_DIR"
mkdir -p "$DEPLOY_DIR/audio_storage"
mkdir -p "$DEPLOY_DIR/logs"

# 3. 创建Python虚拟环境
echo -e "\n${YELLOW}创建Python虚拟环境...${NC}"
cd "$DEPLOY_DIR"
python3 -m venv venv
source venv/bin/activate

# 4. 安装Python依赖
echo -e "\n${YELLOW}安装Python依赖...${NC}"
pip install --upgrade pip
pip install -r voice_app/requirements.txt

# 5. 配置环境变量
echo -e "\n${YELLOW}配置环境变量...${NC}"
cp config.env .env

# 6. 创建Voicevox服务
echo -e "\n${YELLOW}创建Voicevox服务...${NC}"

# 下载Voicevox引擎（如果不存在）
VOICEVOX_DIR="/opt/voicevox"
if [ ! -d "$VOICEVOX_DIR" ]; then
    mkdir -p "$VOICEVOX_DIR"
    cd "$VOICEVOX_DIR"
    
    echo "下载Voicevox引擎..."
    wget -q --show-progress https://github.com/VOICEVOX/voicevox_engine/releases/download/0.14.5/voicevox_engine-linux-x64-cpu-0.14.5.zip
    
    echo "解压Voicevox引擎..."
    apt-get install -y unzip
    unzip voicevox_engine-linux-x64-cpu-0.14.5.zip
    mv voicevox_engine-linux-x64-cpu-0.14.5/* .
    rmdir voicevox_engine-linux-x64-cpu-0.14.5
    
    # 安装Voicevox依赖
    apt-get install -y libsndfile1
    
    # 创建启动脚本
    cat > start_voicevox.sh << 'EOF'
#!/bin/bash
cd /opt/voicevox
./run
EOF
    chmod +x start_voicevox.sh
fi

# 创建Voicevox服务文件
cat > /etc/systemd/system/voicevox.service << EOF
[Unit]
Description=Voicevox Engine Service
After=network.target

[Service]
ExecStart=/opt/voicevox/start_voicevox.sh
WorkingDirectory=/opt/voicevox
Restart=on-failure
RestartSec=5s

[Install]
WantedBy=multi-user.target
EOF

# 7. 创建语音服务
echo -e "\n${YELLOW}创建语音服务...${NC}"
cd "$DEPLOY_DIR"

# 创建语音服务文件
cat > /etc/systemd/system/zcanic_voice.service << EOF
[Unit]
Description=Zcanic Voice Service
After=network.target voicevox.service
Requires=voicevox.service

[Service]
User=root
WorkingDirectory=${DEPLOY_DIR}
Environment="PATH=${DEPLOY_DIR}/venv/bin"
Environment="PYTHONPATH=${DEPLOY_DIR}"
ExecStart=${DEPLOY_DIR}/venv/bin/python -m voice_app.run_service
Restart=on-failure
RestartSec=5s

[Install]
WantedBy=multi-user.target
EOF

# 8. 配置Nginx
echo -e "\n${YELLOW}配置Nginx...${NC}"

cat > /etc/nginx/sites-available/zcanic-voice << EOF
server {
    listen 80;
    server_name _;

    location /api/ {
        proxy_pass http://localhost:8000/api/;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_read_timeout 120s;
    }

    location /audio_storage/ {
        proxy_pass http://localhost:8000/audio_storage/;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        
        # 缓存设置
        expires 7d;
        add_header Cache-Control "public, max-age=604800";
        
        # 大文件优化
        proxy_buffering off;
        proxy_request_buffering off;
        proxy_http_version 1.1;
    }

    location /docs {
        proxy_pass http://localhost:8000/docs;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
    }

    location = / {
        return 302 /docs;
    }

    access_log /var/log/nginx/voice-access.log;
    error_log /var/log/nginx/voice-error.log;
}
EOF

# 启用网站配置
ln -sf /etc/nginx/sites-available/zcanic-voice /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx

# 9. 启动服务
echo -e "\n${YELLOW}启动服务...${NC}"
systemctl daemon-reload
systemctl enable voicevox.service
systemctl enable zcanic_voice.service
systemctl start voicevox.service
systemctl start zcanic_voice.service

# 10. 检查服务状态
echo -e "\n${YELLOW}检查服务状态...${NC}"
sleep 5
systemctl status voicevox.service --no-pager
systemctl status zcanic_voice.service --no-pager

# 11. 测试API
echo -e "\n${YELLOW}测试API...${NC}"
sleep 5
curl -X GET http://localhost:8000/api/health

echo -e "\n${GREEN}=== Zcanic Voice Service 部署完成! ===${NC}"
echo -e "语音服务现在应该已经在 http://$HOSTNAME:8000/api/ 上运行"
echo -e "可以使用以下命令测试服务:"
echo -e "${YELLOW}curl -X GET http://localhost:8000/api/health${NC}"
echo -e "${YELLOW}python $DEPLOY_DIR/voice_app/test_client.py --text \"测试文本\" --server http://localhost:8000${NC}\n"

echo -e "查看服务日志:"
echo -e "${YELLOW}tail -f $DEPLOY_DIR/logs/zcanic_voice.log${NC}\n"

echo -e "如需修改配置，请编辑:"
echo -e "${YELLOW}nano $DEPLOY_DIR/.env${NC}\n"
EOL

# 使脚本可执行
chmod +x "$TEMP_DIR/remote_setup.sh"

# 创建网站集成配置指南
cat > "$TEMP_DIR/website_integration.md" << EOL
# Zcanic语音服务与网站集成指南

## 服务信息

- 语音服务器IP: ${VOICE_SERVER_IP}
- 网站服务器IP: ${WEBSITE_SERVER_IP}
- 语音API端点: http://${VOICE_SERVER_IP}/api/

## 网站服务器配置步骤

1. 在网站服务器上添加以下环境变量:

\`\`\`
VOICE_SERVICE_URL=http://${VOICE_SERVER_IP}
VOICE_API_KEY=your_api_key_here  # 与语音服务器上的API_KEY相同
\`\`\`

2. 添加Nginx反向代理配置:

\`\`\`nginx
# 语音服务API端点
location /voice-api/ {
    proxy_pass http://${VOICE_SERVER_IP}/api/;
    proxy_http_version 1.1;
    proxy_set_header Host \$host;
    proxy_set_header X-Real-IP \$remote_addr;
    proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto \$scheme;
    proxy_read_timeout 120s;
}

# 语音文件访问
location /voice-audio/ {
    proxy_pass http://${VOICE_SERVER_IP}/audio_storage/;
    proxy_set_header Host \$host;
    proxy_set_header X-Real-IP \$remote_addr;
    
    # 缓存设置
    expires 7d;
    add_header Cache-Control "public, max-age=604800";
    
    # 大文件优化
    proxy_buffering off;
}
\`\`\`

3. 前端API集成代码示例:

\`\`\`javascript
// src/services/api.js

// 添加语音服务API
const voice = {
  // 文本到语音转换
  tts: (text, speakerId = 46, messageId = '') => {
    return axios.post('/voice-api/tts', {
      text,
      speaker_id: speakerId,
      message_id: messageId || \`msg-\${Date.now()}\`,
      bypass_cache: false
    });
  },
  
  // 获取说话人列表
  getSpeakers: () => {
    return axios.get('/voice-api/speakers');
  },
};

// 将语音API添加到主API对象
const api = {
  // 现有API方法...
  voice
};
\`\`\`

4. 测试语音功能:

\`\`\`bash
curl -X GET http://${WEBSITE_SERVER_IP}/voice-api/health
\`\`\`

## 更多详情

请参考voice_app目录下的VOICE_INTEGRATION_TODO.md文件获取详细的集成步骤。
EOL

# 打包部署文件
echo -e "\n${YELLOW}打包部署文件...${NC}"
cd "$TEMP_DIR" || exit 1
tar -czf ../voice_app_deploy.tar.gz .

# 上传部署包到语音服务器
echo -e "\n${YELLOW}上传部署包到语音服务器...${NC}"
scp -i "$SSH_KEY" "$LOCAL_DIR/voice_app_deploy.tar.gz" ${SSH_USER}@${VOICE_SERVER_IP}:/tmp/

# 在语音服务器执行安装脚本
echo -e "\n${YELLOW}在语音服务器执行安装脚本...${NC}"
ssh -i "$SSH_KEY" ${SSH_USER}@${VOICE_SERVER_IP} << EOF
mkdir -p ${REMOTE_DIR}
tar -xzf /tmp/voice_app_deploy.tar.gz -C ${REMOTE_DIR}
cd ${REMOTE_DIR}
chmod +x remote_setup.sh
./remote_setup.sh ${REMOTE_DIR}
rm /tmp/voice_app_deploy.tar.gz
EOF

# 清理临时文件
echo -e "\n${YELLOW}清理临时文件...${NC}"
rm -rf "$TEMP_DIR"
rm -f "$LOCAL_DIR/voice_app_deploy.tar.gz"

# 完成
echo -e "\n${GREEN}==================================================${NC}"
echo -e "${GREEN}         Zcanic Voice Service 部署完成!           ${NC}"
echo -e "${GREEN}==================================================${NC}"
echo -e "语音服务已成功部署到服务器: ${YELLOW}${VOICE_SERVER_IP}${NC}"
echo -e "API端点: ${YELLOW}http://${VOICE_SERVER_IP}/api/${NC}"
echo -e "\n查看服务状态:"
echo -e "${BLUE}ssh -i \"$SSH_KEY\" ${SSH_USER}@${VOICE_SERVER_IP} \"systemctl status zcanic_voice\"${NC}"
echo -e "\n查看语音服务日志:"
echo -e "${BLUE}ssh -i \"$SSH_KEY\" ${SSH_USER}@${VOICE_SERVER_IP} \"tail -f ${REMOTE_DIR}/logs/zcanic_voice.log\"${NC}"
echo -e "\n网站集成指南已创建: ${YELLOW}${LOCAL_DIR}/website_integration.md${NC}"
echo -e "请参考该文档配置网站服务器以集成语音功能"
echo -e "${GREEN}==================================================${NC}" 