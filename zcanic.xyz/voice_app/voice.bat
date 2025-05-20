@echo off
:: 切换到脚本所在目录
cd %~dp0

echo 选择操作:
echo [1] 启动语音服务
echo [2] 部署语音服务（安装依赖）
echo [3] 退出
echo.

set /p choice=请输入选项 (1-3): 

if "%choice%"=="1" (
    start start.bat
) else if "%choice%"=="2" (
    start deploy.bat
) else if "%choice%"=="3" (
    exit
) else (
    echo 无效选项，请输入1-3的数字。
    pause
) 