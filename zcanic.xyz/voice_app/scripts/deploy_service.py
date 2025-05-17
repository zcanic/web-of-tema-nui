#!/usr/bin/env python
"""
Zcanic Voice Service 部署脚本
帮助将服务部署为系统服务
"""
import os
import sys
import argparse
import subprocess
import getpass
from pathlib import Path


SYSTEMD_SERVICE_TEMPLATE = """
[Unit]
Description=Zcanic Voice Service
After=network.target

[Service]
User={user}
WorkingDirectory={workdir}
Environment=PYTHONPATH={workdir}
ExecStart={python} -m voice_app.run_service
Restart=on-failure
RestartSec=5s

[Install]
WantedBy=multi-user.target
"""


def create_systemd_service(service_name, python_path, workdir):
    """
    创建systemd服务文件
    
    Args:
        service_name: 服务名称
        python_path: Python解释器路径
        workdir: 工作目录路径
    """
    # 获取当前用户
    user = getpass.getuser()
    
    # 创建服务文件内容
    service_content = SYSTEMD_SERVICE_TEMPLATE.format(
        user=user,
        workdir=workdir,
        python=python_path
    )
    
    # 服务文件路径
    service_path = f"/tmp/{service_name}.service"
    
    # 写入服务文件
    with open(service_path, "w") as f:
        f.write(service_content)
        
    print(f"服务文件已创建: {service_path}")
    
    # 复制到systemd目录
    try:
        cmd = f"sudo cp {service_path} /etc/systemd/system/"
        print(f"正在执行: {cmd}")
        subprocess.run(cmd, shell=True, check=True)
        
        # 重新加载systemd
        print("正在重新加载systemd...")
        subprocess.run("sudo systemctl daemon-reload", shell=True, check=True)
        
        # 启用服务
        print(f"正在启用服务: {service_name}")
        subprocess.run(f"sudo systemctl enable {service_name}", shell=True, check=True)
        
        print(f"\n✅ 服务已成功安装: {service_name}")
        print(f"您可以使用以下命令启动服务:")
        print(f"  sudo systemctl start {service_name}")
        print(f"\n查看服务状态:")
        print(f"  sudo systemctl status {service_name}")
        print(f"\n查看服务日志:")
        print(f"  sudo journalctl -u {service_name} -f")
        
    except subprocess.CalledProcessError as e:
        print(f"❌ 错误: {str(e)}")
        print("您可能需要使用sudo权限运行此脚本。")
        return False
        
    return True


def setup_supervisor_config(service_name, python_path, workdir):
    """
    创建supervisor配置文件
    
    Args:
        service_name: 服务名称
        python_path: Python解释器路径
        workdir: 工作目录路径
    """
    supervisor_conf = f"""
[program:{service_name}]
command={python_path} -m voice_app.run_service
directory={workdir}
environment=PYTHONPATH="{workdir}"
autostart=true
autorestart=true
stderr_logfile={workdir}/logs/supervisor_{service_name}.err.log
stdout_logfile={workdir}/logs/supervisor_{service_name}.out.log
user={getpass.getuser()}
"""
    
    # 确保日志目录存在
    log_dir = os.path.join(workdir, "logs")
    os.makedirs(log_dir, exist_ok=True)
    
    # 配置文件路径
    config_path = f"/tmp/{service_name}.conf"
    
    # 写入配置文件
    with open(config_path, "w") as f:
        f.write(supervisor_conf)
        
    print(f"Supervisor配置文件已创建: {config_path}")
    print(f"\n请将此文件复制到supervisor配置目录:")
    print(f"  sudo cp {config_path} /etc/supervisor/conf.d/")
    print(f"\n然后重新加载supervisor配置:")
    print(f"  sudo supervisorctl reread")
    print(f"  sudo supervisorctl update")
    
    return True


def main():
    """主函数"""
    parser = argparse.ArgumentParser(description="Zcanic Voice Service 部署工具")
    
    # 部署类型
    parser.add_argument(
        "--type", 
        choices=["systemd", "supervisor"], 
        default="systemd",
        help="部署类型: systemd 或 supervisor"
    )
    
    # 服务名称
    parser.add_argument(
        "--name", 
        default="zcanic_voice", 
        help="服务名称"
    )
    
    # Python解释器
    parser.add_argument(
        "--python", 
        default=sys.executable, 
        help="Python解释器路径"
    )
    
    # 工作目录
    parser.add_argument(
        "--workdir", 
        default=str(Path(__file__).parent.parent.parent.absolute()),
        help="工作目录路径"
    )
    
    # 解析命令行参数
    args = parser.parse_args()
    
    print("Zcanic Voice Service 部署工具")
    print(f"部署类型: {args.type}")
    print(f"服务名称: {args.name}")
    print(f"Python解释器: {args.python}")
    print(f"工作目录: {args.workdir}")
    print("-----------------------------------")
    
    # 根据部署类型执行不同的操作
    if args.type == "systemd":
        create_systemd_service(args.name, args.python, args.workdir)
    elif args.type == "supervisor":
        setup_supervisor_config(args.name, args.python, args.workdir)
    
    return 0


if __name__ == "__main__":
    sys.exit(main())