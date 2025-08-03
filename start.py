#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
本地开发服务器启动脚本
支持外部设备访问（手机、平板等）
"""

import os
import sys
from website import app

def get_local_ip():
    """获取本机IP地址"""
    import socket
    try:
        # 获取本机IP地址
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except:
        return "127.0.0.1"

def main():
    # 获取本机IP
    local_ip = get_local_ip()
    port = 5000
    
    print("🚀 启动Momoko个人网站服务器")
    print("=" * 40)
    print(f"📱 本机IP地址: {local_ip}")
    print(f"🌐 访问地址:")
    print(f"   电脑: http://localhost:{port}")
    print(f"   手机: http://{local_ip}:{port}")
    print("=" * 40)
    
    # 检查环境变量
    if not os.getenv('OPENAI_API_KEY'):
        print("⚠️  警告: 未设置OPENAI_API_KEY环境变量")
        print("   聊天功能可能无法正常工作")
        print("   请运行: python setup_env.py")
        print()
    
    try:
        # 启动服务器，允许外部访问
        app.run(
            host='0.0.0.0',  # 允许外部访问
            port=port,
            debug=True,
            threaded=True
        )
    except KeyboardInterrupt:
        print("\n👋 服务器已停止")
    except Exception as e:
        print(f"❌ 启动失败: {e}")
        sys.exit(1)

if __name__ == '__main__':
    main() 