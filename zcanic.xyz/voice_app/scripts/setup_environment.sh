#!/bin/bash
# Zcanic Voice Service 环境配置脚本

set -e

# 显示彩色文本
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== Zcanic Voice Service 环境配置 ===${NC}"
echo "此脚本将帮助您设置运行语音服务所需的环境"
echo 

# 检查Python版本
echo -e "${YELLOW}检查Python版本...${NC}"
if command -v python3 &>/dev/null; then
    PYTHON_CMD=python3
elif command -v python &>/dev/null; then
    PYTHON_CMD=python
else
    echo -e "${RED}错误: 未找到Python！请安装Python 3.8+${NC}"
    exit 1
fi

PYTHON_VERSION=$($PYTHON_CMD --version | awk '{print $2}')
echo -e "找到Python: ${GREEN}$PYTHON_VERSION${NC}"

# 检查Python版本是否>=3.8
PYTHON_MAJOR=$($PYTHON_CMD -c "import sys; print(sys.version_info.major)")
PYTHON_MINOR=$($PYTHON_CMD -c "import sys; print(sys.version_info.minor)")

if [ $PYTHON_MAJOR -lt 3 ] || ([ $PYTHON_MAJOR -eq 3 ] && [ $PYTHON_MINOR -lt 8 ]); then
    echo -e "${RED}错误: Python版本必须>=3.8，当前版本为${PYTHON_VERSION}${NC}"
    echo "请升级Python后再运行此脚本"
    exit 1
fi

# 检查pip
echo -e "\n${YELLOW}检查pip...${NC}"
if ! command -v pip &>/dev/null && ! command -v pip3 &>/dev/null; then
    echo -e "${RED}错误: 未找到pip！请安装pip${NC}"
    echo "您可以尝试运行: $PYTHON_CMD -m ensurepip --upgrade"
    exit 1
fi

if command -v pip3 &>/dev/null; then
    PIP_CMD=pip3
else
    PIP_CMD=pip
fi

echo -e "找到pip: ${GREEN}$($PIP_CMD --version)${NC}"

# 检查项目根目录
SCRIPT_DIR=$(dirname $(readlink -f "$0"))
PROJECT_ROOT=$(dirname $(dirname "$SCRIPT_DIR"))

if [ ! -f "$PROJECT_ROOT/voice_app/requirements.txt" ]; then
    echo -e "${RED}错误: 未找到项目根目录！${NC}"
    echo "请在项目根目录中运行此脚本"
    exit 1
fi

# 创建虚拟环境
echo -e "\n${YELLOW}创建虚拟环境...${NC}"
if [ ! -d "$PROJECT_ROOT/venv" ]; then
    echo "创建新的虚拟环境 (venv)..."
    $PYTHON_CMD -m venv "$PROJECT_ROOT/venv"
else
    echo "虚拟环境已存在"
fi

# 激活虚拟环境
echo -e "\n${YELLOW}激活虚拟环境...${NC}"
source "$PROJECT_ROOT/venv/bin/activate" || {
    echo -e "${RED}错误: 无法激活虚拟环境${NC}"
    exit 1
}

echo -e "当前Python解释器: ${GREEN}$(which python)${NC}"

# 安装依赖
echo -e "\n${YELLOW}安装依赖...${NC}"
pip install --upgrade pip
pip install -r "$PROJECT_ROOT/voice_app/requirements.txt"

# 创建配置文件
echo -e "\n${YELLOW}创建配置文件...${NC}"
if [ ! -f "$PROJECT_ROOT/.env" ]; then
    echo "创建.env文件..."
    cp "$PROJECT_ROOT/voice_app/config.example.env" "$PROJECT_ROOT/.env"
    echo -e "${GREEN}创建了.env文件，请编辑填入您的API密钥${NC}"
else
    echo -e ".env文件已存在，${YELLOW}请确保其中包含必要的配置${NC}"
fi

# 创建存储目录
echo -e "\n${YELLOW}创建存储目录...${NC}"
mkdir -p "$PROJECT_ROOT/audio_storage"
mkdir -p "$PROJECT_ROOT/logs"

# 检查Voicevox引擎
echo -e "\n${YELLOW}检查Voicevox引擎...${NC}"
echo "注意: 此脚本无法自动安装Voicevox引擎"
echo "请确保Voicevox引擎已安装并在配置文件中设置了正确的URL"
echo "Voicevox引擎下载: https://voicevox.hiroshiba.jp/"

# 提示运行服务
echo -e "\n${GREEN}=== 设置完成! ===${NC}"
echo -e "您现在可以使用以下命令启动语音服务:"
echo -e "${YELLOW}cd $PROJECT_ROOT${NC}"
echo -e "${YELLOW}source venv/bin/activate${NC}"
echo -e "${YELLOW}python run_voice_service.py${NC}"
echo 
echo -e "访问API文档: ${GREEN}http://localhost:8000/docs${NC}"
echo -e "测试客户端: ${GREEN}python voice_app/test_client.py --text \"你好，世界\"${NC}" 