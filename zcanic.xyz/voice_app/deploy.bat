@echo off
echo ===================================
echo    Zcanic Voice Service 一键部署
echo ===================================
echo.

:: 设置颜色
color 0A

:: 切换到voice_app所在目录
cd %~dp0

echo [1/3] 正在检查并安装依赖...
pip install uvicorn fastapi loguru python-dotenv pyyaml requests -q

IF %ERRORLEVEL% NEQ 0 (
    color 0C
    echo 依赖安装失败！请检查网络连接或Python环境。
    goto :error
)

echo [2/3] 正在检查配置文件...
IF NOT EXIST audio_storage (
    echo 创建音频存储目录...
    mkdir audio_storage
)

IF NOT EXIST logs (
    echo 创建日志目录...
    mkdir logs
)

echo [3/3] 启动服务...
echo.
echo 服务启动成功后，可通过以下地址访问:
echo - 主页: http://localhost:8000
echo - API文档: http://localhost:8000/docs
echo.
echo 按Ctrl+C可停止服务
echo ===================================
echo.

:: 启动服务
python start_service.py

goto :end

:error
echo.
echo 部署过程中出现错误，请查看上方日志。
pause
exit /b 1

:end
pause 