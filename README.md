# Momoko个人简历网站

## 🌐 在线访问

**访问地址**: https://momoko-yang.github.io

---

## 📖 项目简介

### 中文版

这是一个基于开源项目开发的个人简历网站，集成了智能AI聊天助手功能，经过全面优化和重构。

#### 开源致谢
本项目基于 ZYYO666 的优秀开源项目 homepage 进行了二次开发，在此向原作者表示衷心的感谢！开源精神让技术学习变得更加美好。

#### 主要功能与特色
在原项目基础上，我进行了以下重要开发和优化：

1. **🔒 简历访问密码保护**：点击简历时增加了密码验证功能，提升了个人信息的隐私保护
2. **🤖 智能AI聊天助手**：集成了基于GPT-4o-mini模型的智能聊天机器人，支持多语言对话
3. **⚡ 快速回复优化**：实现了本地预设内容的快速回复功能，大幅提升响应速度
4. **🎯 智能提示词优化**：为大模型设置了简洁高效的提示词，确保回复质量
5. **🌍 多语言智能识别**：自动检测用户输入语言，提供相应语言的回复
6. **📱 响应式设计优化**：完美适配各种设备，提供流畅的用户体验

#### 技术特色
- 🤖 **智能对话**：使用OpenAI GPT-4o-mini模型，支持自然语言交互
- ⚡ **快速回复**：本地预设内容优先，响应速度极快
- 🔒 **隐私保护**：简历内容需要密码验证，API调用安全可靠
- 🌍 **多语言支持**：支持中文、英文、日文智能识别和回复
- 📱 **响应式设计**：完美适配桌面、平板、手机等各种设备
- 🎨 **现代化UI**：美观的用户界面设计，流畅的动画效果
- 🚀 **性能优化**：代码精简，加载速度快，用户体验佳

#### 学习初衷
这只是个人的兴趣所在，也是一个初学者的尝试。
通过这个项目，我学习了前端开发、AI集成、API调用、性能优化等技术知识。

---

### English Version

This is a personal resume website developed based on an open-source project, featuring an intelligent AI chatbot with comprehensive optimization and refactoring.

#### Open Source Acknowledgments
This project is developed based on the open-source project homepage by ZYYO666, and I would like to express my sincere gratitude to the original author! The open-source spirit makes technology learning more wonderful.

#### Major Features and Improvements
Based on the original project, I made the following important developments and optimizations:

1. **🔒 Resume Access Password Protection**: Added password verification when clicking on the resume, enhancing privacy protection for personal information
2. **🤖 Intelligent AI Chatbot**: Integrated an intelligent chatbot based on the GPT-4o-mini model, supporting multilingual conversations
3. **⚡ Quick Reply Optimization**: Implemented fast reply functionality with local preset content, significantly improving response speed
4. **🎯 Smart Prompt Optimization**: Set concise and efficient prompts for the large model to ensure response quality
5. **🌍 Multilingual Smart Recognition**: Automatically detects user input language and provides responses in the corresponding language
6. **📱 Responsive Design Optimization**: Perfectly adapts to various devices, providing smooth user experience

#### Technical Features
- 🤖 **Intelligent Dialogue**: Using OpenAI GPT-4o-mini model, supporting natural language interaction
- ⚡ **Quick Reply**: Local preset content priority, extremely fast response speed
- 🔒 **Privacy Protection**: Resume content requires password verification, secure API calls
- 🌍 **Multilingual Support**: Supports Chinese, English, and Japanese smart recognition and responses
- 📱 **Responsive Design**: Perfectly adapts to desktop, tablet, mobile and other devices
- 🎨 **Modern UI**: Beautiful user interface design with smooth animations
- 🚀 **Performance Optimization**: Streamlined code, fast loading, excellent user experience

#### Learning Purpose
This is just a personal interest and an attempt by a beginner. Through this project, I learned frontend development, AI integration, API calling, performance optimization, and other technical knowledge.

---

## 🚀 快速开始

### 本地开发
```bash
# 克隆仓库
git clone https://github.com/Momoko-YANG/Momoko-YANG.github.io.git
cd Momoko-YANG.github.io

# 安装依赖
pip install -r requirements.txt

# 配置API密钥
python setup_env.py

# 启动后端服务器
python start.py

# 在浏览器中打开 index.html
```

### Docker部署
```bash
# 使用Docker Compose启动
docker-compose up -d

# 或使用生产配置
docker-compose -f docker-compose.prod.yml up -d
```

### 在线访问
直接访问：https://momoko-yang.github.io

## 🤖 AI聊天功能

### 功能特点
- **⚡ 快速回复**：本地预设内容优先，响应速度极快
- **🤖 智能问答**：关于教育背景、专业技能、研究领域、联系方式、兴趣爱好等
- **🌍 多语言支持**：中文、英文、日文智能识别和回复
- **🎯 智能提示词**：优化的系统提示词，确保回复简洁完整
- **💬 实时对话**：流畅的聊天体验，支持打字机效果
- **🔒 隐私保护**：安全的API调用，错误处理机制完善

### 快速回复功能
- **教育背景**：吉林大学经济学学士，早稻田大学经济学硕士
- **专业技能**：Python、R语言、Java、SQL、机器学习等
- **联系方式**：邮箱、GitHub等联系信息
- **兴趣爱好**：详细描述个人爱好和兴趣领域

### 使用方法
1. 点击页面右下角的聊天机器人图标
2. 使用快速回复按钮获取预设信息
3. 或直接输入问题与AI助手对话
4. 支持中文、英文、日文三种语言

---

## 🎯 最新优化

### 性能优化
- **⚡ 快速回复优先**：本地预设内容优先显示，大幅提升响应速度
- **🎯 提示词优化**：为大模型设置简洁高效的提示词，控制回复长度和质量
- **🔧 代码重构**：优化代码结构，消除冗余，提升维护性
- **📁 文件清理**：删除不必要的测试文件和临时文档，保持项目整洁

### 功能增强
- **🌍 语言检测**：智能识别用户输入语言
- **💬 打字机效果**：消息显示动画效果
- **🔄 错误处理**：完善的错误处理和回退机制
- **📱 移动端优化**：更好的移动设备体验

---

## 🙏 致谢

- 感谢原开源项目的作者提供的优秀基础代码
- 感谢OpenAI提供的强大AI模型支持
- 感谢GitHub提供的免费托管服务
- 感谢所有为开源社区做出贡献的开发者们

---

## 🔧 配置说明

### 环境配置
1. 复制 `env_example.txt` 为 `.env`
2. 运行 `python setup_env.py` 配置API密钥
3. 编辑 `static/js/config.js` 中的API地址

### 自定义内容
- 修改 `index.html` 中的个人信息
- 更新 `static/img/` 中的图片
- 调整 `static/css/` 中的样式
- 在 `chatbot_optimized.js` 中自定义快速回复内容

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

**⭐ 如果这个项目对您有帮助，请给个Star支持一下！**




