#!/bin/bash

echo "🚀 部署到GitHub Pages"
echo "=================="

# 检查Git是否安装
if ! command -v git &> /dev/null; then
    echo "❌ Git未安装，请先安装Git"
    exit 1
fi

# 检查是否在Git仓库中
if [ ! -d ".git" ]; then
    echo "❌ 当前目录不是Git仓库"
    echo "请先运行: git init"
    exit 1
fi

# 添加所有文件
echo "📦 添加文件到Git..."
git add .

# 提交更改
echo "💾 提交更改..."
git commit -m "Update website $(date)"

# 推送到GitHub
echo "🚀 推送到GitHub..."
git push origin main

echo "✅ 部署完成！"
echo "🌐 您的网站将在几分钟后可用："
echo "   https://momoko-yang.github.io"
echo ""
echo "📝 注意："
echo "   - 后端API需要单独部署到云平台"
echo "   - 聊天功能需要配置后端API地址"
echo "   - 在GitHub仓库设置中启用Pages功能" 