#!/bin/bash

echo "🚀 个人网站部署脚本"
echo "=================="

# 检查Docker是否安装
if ! command -v docker &> /dev/null; then
    echo "❌ Docker未安装，请先安装Docker"
    exit 1
fi

# 检查Docker Compose是否安装
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose未安装，请先安装Docker Compose"
    exit 1
fi

echo "✅ Docker环境检查通过"

# 构建镜像
echo "📦 构建Docker镜像..."
docker-compose -f docker-compose.prod.yml build

# 启动服务
echo "🚀 启动服务..."
docker-compose -f docker-compose.prod.yml up -d

# 检查服务状态
echo "🔍 检查服务状态..."
sleep 5
docker-compose -f docker-compose.prod.yml ps

echo "🎉 部署完成！"
echo "🌐 访问地址: http://localhost"
echo "📊 查看日志: docker-compose -f docker-compose.prod.yml logs -f"
echo "🛑 停止服务: docker-compose -f docker-compose.prod.yml down" 