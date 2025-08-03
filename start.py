#!/usr/bin/env python3
"""
简化的Flask服务器启动脚本
"""

import os
import sys
from dotenv import load_dotenv

def main():
    """启动Flask服务器"""
    print("🚀 启动Momoko AI聊天后端服务器...")
    
    # 加载环境变量
    load_dotenv()
    
    # 检查API密钥
    api_key = os.getenv('OPENAI_API_KEY')
    if not api_key:
        print("⚠️  警告: 未配置OPENAI_API_KEY环境变量")
        print("请在.env文件中设置OPENAI_API_KEY，或设置环境变量")
        print("示例: export OPENAI_API_KEY='your-api-key-here'")
    
    # 检查依赖
    try:
        import flask
        import openai
        print("✅ 依赖检查通过")
    except ImportError as e:
        print(f"❌ 缺少依赖: {e}")
        print("请运行: pip install -r requirements.txt")
        sys.exit(1)
    
    # 启动服务器
    try:
        from website import app
        print("✅ Flask应用加载成功")
        print("🌐 服务器将在 http://localhost:5000 启动")
        print("📡 API端点: http://localhost:5000/api/chat")
        print("🏥 健康检查: http://localhost:5000/api/health")
        print("\n按 Ctrl+C 停止服务器")
        
        app.run(debug=True, host='0.0.0.0', port=5000)
        
    except Exception as e:
        print(f"❌ 启动服务器失败: {e}")
        sys.exit(1)

if __name__ == '__main__':
    main() 