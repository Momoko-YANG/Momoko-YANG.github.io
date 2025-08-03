# 🚀 网站部署指南

## 📋 部署概览

本项目包含前端（静态网站）和后端（Flask API），需要分别部署：

- **前端**：GitHub Pages（免费）
- **后端**：云平台（Render/Railway/Heroku等）

---

## 🌐 前端部署（GitHub Pages）

### 1. 准备工作

#### 安装Git
```bash
# Windows: 下载安装包
# https://git-scm.com/downloads

# macOS: 使用Homebrew
brew install git

# Linux: 使用包管理器
sudo apt-get install git  # Ubuntu/Debian
sudo yum install git      # CentOS/RHEL
```

#### 配置Git
```bash
git config --global user.name "你的GitHub用户名"
git config --global user.email "你的邮箱"
```

### 2. 创建GitHub仓库

1. 访问 https://github.com
2. 点击 "New repository"
3. 设置仓库名：`Momoko-YANG.github.io`
4. 选择 "Public"
5. 不要初始化README（已有文件）

### 3. 上传代码

```bash
# 在项目目录中执行
git init
git remote add origin https://github.com/Momoko-YANG/Momoko-YANG.github.io.git
git add .
git commit -m "Initial commit: Personal resume website with AI chatbot"
git push -u origin main
```

### 4. 启用GitHub Pages

1. 在GitHub仓库页面，点击 "Settings"
2. 左侧菜单选择 "Pages"
3. Source选择 "Deploy from a branch"
4. Branch选择 "main"，文件夹选择 "/ (root)"
5. 点击 "Save"

**等待几分钟后，你的网站将在 https://momoko-yang.github.io 可用**

---

## 🔧 后端部署（云平台）

### 选项1：Render（推荐，免费）

#### 1. 注册账号
访问 https://render.com 注册账号

#### 2. 连接GitHub
1. 登录Render
2. 点击 "New Web Service"
3. 连接GitHub账号
4. 选择你的仓库

#### 3. 配置部署
- **Name**: `momoko-yang-backend`
- **Environment**: `Python 3`
- **Build Command**: `pip install -r requirements.txt`
- **Start Command**: `python start.py`
- **Plan**: `Free`

#### 4. 设置环境变量
在 "Environment" 标签页添加：
```
OPENAI_API_KEY=你的OpenAI_API密钥
```

#### 5. 部署
点击 "Create Web Service"，等待部署完成

**你的后端API地址将是：`https://momoko-yang-backend.onrender.com`**

### 选项2：Railway（推荐，免费额度）

#### 1. 注册账号
访问 https://railway.app 注册账号

#### 2. 创建项目
1. 点击 "New Project"
2. 选择 "Deploy from GitHub repo"
3. 选择你的仓库

#### 3. 配置环境变量
在 "Variables" 标签页添加：
```
OPENAI_API_KEY=你的OpenAI_API密钥
```

#### 4. 部署
Railway会自动检测Python项目并部署

**你的后端API地址将是：`https://your-app-name.railway.app`**

### 选项3：Heroku（需要信用卡验证）

#### 1. 注册账号
访问 https://heroku.com 注册账号

#### 2. 安装Heroku CLI
```bash
# Windows: 下载安装包
# https://devcenter.heroku.com/articles/heroku-cli

# macOS: 使用Homebrew
brew tap heroku/brew && brew install heroku

# Linux: 使用脚本
curl https://cli-assets.heroku.com/install.sh | sh
```

#### 3. 登录Heroku
```bash
heroku login
```

#### 4. 创建应用
```bash
heroku create momoko-yang-backend
```

#### 5. 设置环境变量
```bash
heroku config:set OPENAI_API_KEY=你的OpenAI_API密钥
```

#### 6. 部署
```bash
git push heroku main
```

**你的后端API地址将是：`https://momoko-yang-backend.herokuapp.com`**

---

## ⚙️ 配置更新

### 更新API地址

部署完成后，需要更新 `static/js/config.js` 中的后端API地址：

```javascript
production: {
    apiUrl: 'https://你的后端地址/api/chat', // 替换为实际地址
    baseUrl: 'https://momoko-yang.github.io',
    disableBackendAPI: false
}
```

### 重新部署前端

更新配置后，重新提交到GitHub：

```bash
git add .
git commit -m "Update backend API configuration"
git push origin main
```

---

## 🧪 测试部署

### 1. 测试前端
访问 https://momoko-yang.github.io 确认网站正常加载

### 2. 测试后端API
```bash
curl -X POST https://你的后端地址/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello", "language": "en"}'
```

### 3. 测试聊天功能
在网站中打开聊天机器人，测试快速回复和AI对话功能

---

## 🔍 故障排除

### 常见问题

#### 1. GitHub Pages不更新
- 检查仓库设置中的Pages配置
- 等待几分钟让GitHub Pages重新构建
- 清除浏览器缓存

#### 2. 后端API连接失败
- 检查API地址是否正确
- 确认环境变量已设置
- 查看云平台日志

#### 3. 聊天功能不工作
- 检查浏览器控制台错误
- 确认后端API正常运行
- 验证OpenAI API密钥有效

### 查看日志

#### Render
在Render控制台查看 "Logs" 标签页

#### Railway
在Railway控制台查看 "Deployments" 标签页

#### Heroku
```bash
heroku logs --tail
```

---

## 📊 部署状态检查

### 前端检查清单
- [ ] GitHub仓库创建成功
- [ ] 代码上传完成
- [ ] GitHub Pages已启用
- [ ] 网站可以正常访问

### 后端检查清单
- [ ] 云平台账号注册完成
- [ ] 项目部署成功
- [ ] 环境变量已设置
- [ ] API可以正常响应

### 集成检查清单
- [ ] 配置文件已更新
- [ ] 前端重新部署
- [ ] 聊天功能正常
- [ ] 快速回复工作

---

## 🎉 部署完成

恭喜！你的个人简历网站已经成功部署：

- **前端地址**: https://momoko-yang.github.io
- **后端API**: https://你的后端地址

### 后续维护

1. **更新内容**: 修改代码后推送到GitHub
2. **监控日志**: 定期检查云平台日志
3. **备份数据**: 定期备份重要配置
4. **性能优化**: 根据使用情况调整配置

---

## 📞 技术支持

如果遇到问题，可以：

1. 查看云平台文档
2. 检查GitHub Issues
3. 联系技术支持
4. 查看项目文档

---

*部署指南更新时间: 2025年08月* 