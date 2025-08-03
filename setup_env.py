#!/usr/bin/env python3
"""
环境配置脚本
用于设置OpenAI API密钥
"""

import os
import sys

def setup_environment():
    """设置环境变量"""
    print("🔧 OpenAI API密钥配置")
    print("=" * 50)
    
    # 检查是否已有.env文件
    if os.path.exists('.env'):
        print("✅ 发现现有的.env文件")
        with open('.env', 'r', encoding='utf-8') as f:
            content = f.read()
            if 'OPENAI_API_KEY' in content:
                print("✅ API密钥已配置在.env文件中")
                return True
    
    # 获取用户输入的API密钥
    print("请输入您的OpenAI API密钥:")
    print("(如果没有，请访问 https://platform.openai.com/api-keys 获取)")
    
    api_key = input("API密钥: ").strip()
    
    if not api_key:
        print("❌ 未输入API密钥")
        return False
    
    # 创建.env文件
    try:
        with open('.env', 'w', encoding='utf-8') as f:
            f.write(f"# OpenAI API配置\n")
            f.write(f"OPENAI_API_KEY={api_key}\n")
            f.write(f"\n# Flask配置\n")
            f.write(f"FLASK_ENV=development\n")
            f.write(f"FLASK_DEBUG=True\n")
        
        print("✅ .env文件创建成功")
        print(f"📝 API密钥已保存: {api_key[:20]}...{api_key[-10:]}")
        return True
        
    except Exception as e:
        print(f"❌ 创建.env文件失败: {e}")
        return False

def test_api_key():
    """测试API密钥"""
    print("\n🧪 测试API密钥...")
    
    try:
        from dotenv import load_dotenv
        load_dotenv()
        
        api_key = os.getenv('OPENAI_API_KEY')
        if not api_key:
            print("❌ 未找到API密钥")
            return False
        
        from openai import OpenAI
        client = OpenAI(api_key=api_key)
        
        # 简单测试
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": "Hello"}],
            max_tokens=10
        )
        
        print("✅ API密钥测试成功")
        return True
        
    except Exception as e:
        print(f"❌ API密钥测试失败: {e}")
        return False

def main():
    """主函数"""
    success = setup_environment()
    
    if success:
        print("\n🎉 配置完成！")
        print("现在可以运行: python start.py")
        
        # 询问是否要测试
        test = input("\n是否要测试API密钥? (y/n): ").strip().lower()
        if test == 'y':
            test_api_key()
    else:
        print("\n💥 配置失败")
        sys.exit(1)

if __name__ == '__main__':
    main() 