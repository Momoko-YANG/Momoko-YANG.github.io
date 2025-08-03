# Momoko个人简历网站 - 完整文档

## 📖 项目简介

这是一个基于开源项目开发的个人简历网站，集成了AI聊天助手功能。

### 🌐 在线访问
**访问地址**: https://momoko-yang.github.io

### 开源致谢
本项目基于 ZYYO666 的优秀开源项目 homepage 进行了二次开发，在此向原作者表示衷心的感谢！

### 主要修改
1. **简历访问密码保护**：点击简历时增加了密码验证功能
2. **AI聊天助手**：集成了基于GPT-4o-mini模型的智能聊天机器人，支持多语言对话

### 技术特色
- 🤖 **智能对话**：使用OpenAI GPT-4o-mini模型
- 🔒 **隐私保护**：简历内容需要密码验证
- 🌍 **多语言支持**：支持中文、英文、日文对话
- 📱 **响应式设计**：完美适配各种设备
- 🎨 **现代化UI**：美观的用户界面设计

---

## 🚀 快速开始

### 步骤1：安装依赖
```bash
pip install -r requirements.txt
```

### 步骤2：配置API密钥
```bash
# 方法1：使用配置脚本（推荐）
python setup_env.py

# 方法2：手动配置
cp env_example.txt .env
# 编辑 .env 文件，设置您的OpenAI API密钥
# OPENAI_API_KEY=your-api-key-here
```

### 步骤3：启动后端服务器
```bash
python start.py
# 或直接运行
python website.py
```

### 步骤4：打开网页
在浏览器中打开 `index.html` 文件

### 步骤5：开始聊天
点击页面右下角的聊天机器人图标开始对话

---

## 🔧 API配置说明

### OpenAI API配置

1. **获取API密钥**：
   - 访问 https://platform.openai.com/api-keys
   - 创建新的API密钥

2. **设置环境变量**：
   ```bash
   # Windows PowerShell
   $env:OPENAI_API_KEY="your_openai_api_key_here"
   
   # Windows CMD
   set OPENAI_API_KEY=your_openai_api_key_here
   
   # Linux/Mac
   export OPENAI_API_KEY="your_openai_api_key_here"
   ```

3. **使用.env文件（推荐）**：
   ```bash
   cp env_example.txt .env
   # 编辑.env文件，设置您的API密钥
   OPENAI_API_KEY=your_openai_api_key_here
   ```

### 模型优先级
1. **OpenAI GPT-4o-mini** (主要)
2. **本地回复** (备选)

---

## 🛠️ 故障排除

### 常见问题

#### 1. "Failed to fetch" 错误
**原因**：后端服务器未启动
**解决**：
```bash
python start.py
# 或
python website.py
```

#### 2. OpenAI初始化失败
**错误信息**：
```
ERROR:__main__:OpenAI客户端初始化失败: Client.__init__() got an unexpected keyword argument 'proxies'
```

**解决方案**：
```bash
# 重新安装OpenAI库（推荐）
pip install --upgrade openai

# 或完全重新安装
pip uninstall openai -y
pip install openai==1.12.0
```

#### 3. 端口被占用
**解决**：
```bash
# 查找占用端口的进程
netstat -ano | findstr :5000

# 或者修改website.py中的端口
app.run(debug=True, host='0.0.0.0', port=5001)
```

### 检查系统状态
```bash
# 运行统一测试工具
python test_backend.py
```

---

## 🚀 部署指南

### 选项1：静态网站托管（仅前端）

#### GitHub Pages
```bash
# 1. 创建GitHub仓库
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/your-repo-name.git
git push -u origin main

# 2. 在GitHub仓库设置中启用Pages
# Settings > Pages > Source: Deploy from a branch > main
```

**优点**：免费、简单、自动HTTPS
**缺点**：无法运行后端API（聊天功能不可用）

#### 启用GitHub Pages步骤
1. 访问您的GitHub仓库
2. 点击 **Settings** 标签
3. 左侧菜单找到 **Pages**
4. **Source** 选择：Deploy from a branch
5. **Branch** 选择：main
6. **Folder** 选择：/ (root)
7. 点击 **Save**

### 选项2：完整部署（推荐）

#### 使用Docker部署到云服务器

1. **准备服务器**（阿里云/腾讯云/AWS等）
```bash
# 安装Docker
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER

# 安装Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

2. **启动服务**
```bash
docker-compose -f docker-compose.prod.yml up -d
```

#### 使用云平台

##### Railway
- 连接GitHub仓库
- 设置环境变量
- 自动部署

##### Render
- 连接GitHub仓库
- 选择Python环境
- 设置环境变量

##### Heroku
```bash
# 安装Heroku CLI
# 创建Procfile
echo "web: python app.py" > Procfile

# 部署
heroku create your-app-name
heroku config:set OPENAI_API_KEY=your-api-key
git push heroku main
```

### 生产环境配置

#### 修改app.py
```python
if __name__ == '__main__':
    # 生产环境配置
    app.run(host='0.0.0.0', port=int(os.environ.get('PORT', 5000)))
```

#### 环境变量
```bash
# 生产环境设置
export FLASK_ENV=production
export OPENAI_API_KEY=your-api-key
```

#### 域名和SSL
1. **购买域名**（阿里云/腾讯云等）
2. **配置DNS**指向服务器IP
3. **配置SSL证书**（Let's Encrypt免费）

---

## 📁 项目结构

```
Momoko-YANG.github.io/
├── index.html              # 主页面
├── static/                 # 静态资源
│   ├── css/               # 样式文件
│   ├── js/                # JavaScript文件
│   ├── img/               # 图片资源
│   ├── fonts/             # 字体文件
│   └── files/             # 其他文件
├── website.py             # Flask后端
├── start.py               # 启动脚本
├── setup_env.py           # 环境配置脚本
├── test_backend.py        # 统一测试工具
├── requirements.txt       # Python依赖
├── docker-compose.yaml    # Docker开发配置
├── docker-compose.prod.yml # Docker生产配置
├── Dockerfile             # Docker镜像配置
└── README.md             # 项目说明
```

---

## 🤖 AI聊天功能

### 功能特点
- **智能问答**：关于教育背景、专业技能、研究领域、联系方式等
- **多语言支持**：中文、英文、日文
- **实时对话**：流畅的聊天体验
- **隐私保护**：安全的API调用

### 使用方法
1. 点击页面右下角的聊天机器人图标
2. 开始与AI助手对话
3. 询问关于Momoko的教育背景、专业技能、研究领域等问题

### 测试聊天
尝试这些对话：
- "你好，请介绍一下你自己"
- "What skills does Momoko have?"
- "Momokoの趣味は何ですか？"

---

## 🛠️ 技术栈

### 前端技术
- **HTML5** - 页面结构
- **CSS3** - 样式设计
- **JavaScript** - 交互逻辑
- **响应式设计** - 多设备适配

### AI集成
- **OpenAI GPT-4o-mini** - 智能对话模型
- **Flask** - 后端API服务
- **CORS** - 跨域请求处理

### 部署平台
- **GitHub Pages** - 静态网站托管
- **云平台** - 后端API部署

---

## 📊 监控和维护

### 日志监控
```bash
# 查看容器日志
docker-compose logs -f web

# 查看应用日志
tail -f app.log
```

### 性能优化
- 使用Nginx作为反向代理
- 配置CDN加速静态资源
- 启用Gzip压缩

### 备份策略
```bash
# 定期备份
docker-compose exec web python backup.py
```

---

## 💰 成本估算

### 静态托管（仅前端）
- GitHub Pages: 免费
- Netlify: 免费（有限制）

### 完整部署
- 云服务器: ¥50-200/月
- 域名: ¥50-100/年
- SSL证书: 免费（Let's Encrypt）

---

## 🎯 推荐方案

### 新手推荐
1. **开发阶段**：本地运行
2. **演示阶段**：GitHub Pages（仅前端）
3. **正式上线**：云服务器 + Docker

### 企业推荐
1. **容器化部署**：Docker + Kubernetes
2. **负载均衡**：Nginx + 多实例
3. **监控告警**：Prometheus + Grafana

---

## 🔧 配置说明

### 环境配置
编辑 `static/js/config.js`：
```javascript
production: {
    apiUrl: 'https://your-backend-domain.com/api/chat', // 替换为实际后端地址
    baseUrl: 'https://momoko-yang.github.io'
}
```

### 自定义内容
- 修改 `index.html` 中的个人信息
- 更新 `static/img/` 中的图片
- 调整 `static/css/` 中的样式

---

## 📝 更新日志

### v1.0.0 (2024-12-19)
- ✨ 基于开源项目创建个人简历网站
- 🔒 添加简历访问密码保护功能
- 🤖 集成GPT-4o-mini AI聊天助手
- 🌍 支持多语言对话
- 📱 响应式设计优化

---

## 🤝 贡献指南

欢迎提交Issue和Pull Request！

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

---

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

---

## 📞 联系方式

- **GitHub**: [@Momoko-YANG](https://github.com/Momoko-YANG)
- **网站**: https://momoko-yang.github.io
- **邮箱**: [您的邮箱地址]

---

## 🧹 项目清理总结

### 已完成的优化
- ✅ 删除了4个冗余的测试文件
- ✅ 修复了代码重复问题
- ✅ 整合了测试功能
- ✅ 清理了缓存文件
- ✅ 提升了代码质量和维护性

### 优化效果
- **文件数量减少**: 从 25+ 个文件减少到 20 个核心文件 (-20%)
- **功能整合**: 测试功能统一到单个文件
- **重复代码消除**: 修复了API密钥重复配置问题
- **维护性提升**: 文件结构更清晰，便于维护

---

**⭐ 如果这个项目对您有帮助，请给个Star支持一下！** 