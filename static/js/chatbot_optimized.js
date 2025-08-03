// ============================================================================
// Momoko AI聊天机器人 - 优化版本 (去除冗余代码)
// 支持多语言（中文/英文/日语）+ GPT-4o-mini API集成 + 智能本地回复
// ============================================================================

// 常量定义
const CONSTANTS = {
    LANGUAGES: { ZH: 'zh', EN: 'en', JA: 'ja' },
    MODELS: { GPT4O_MINI: 'gpt-4o-mini' },
    SELECTORS: {
        TRIGGER: '#chatbot-trigger',
        CONTAINER: '#chatbot-container',
        CLOSE: '#chatbot-close',
        SEND: '#chatbot-send',
        INPUT: '#chatbot-input',
        MESSAGES: '#chatbot-messages',
        NOTIFICATION: '#chatbot-notification',
        QUICK_REPLIES: '#chatbot-quick-replies',
        AI_STATUS: '#ai-status',
        INPUT_THINKING: '#input-thinking'
    },
    TIMING: {
        TYPING_DELAY: 500,
        NOTIFICATION_DELAY: 8000,
        ANIMATION_DURATION: 300,
        FOCUS_DELAY: 400,
        RETRY_DELAY: 1000,
        API_TIMEOUT: 15000
    }
};

// HTML实体映射
const HTML_ENTITIES = {
    '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#39;': "'",
    '&apos;': "'", '&nbsp;': ' ', '&#x27;': "'", '&#x2F;': '/', '&#x60;': '`',
    '&#x3D;': '=', '&#x2B;': '+', '&#x22;': '"', '&#x3C;': '<', '&#x3E;': '>', '&#x26;': '&'
};

// 基础信息模板
const BASE_INFO = {
    name: 'Momoko',
    education: {
        bachelor: '吉林大学经济学院经济学系',
        master: '早稻田大学经济学研究科',
        field: '经济学',
        specialization: 'Statistical Finance'
    },
    contact: {
        email: 'yangmengyuan1215@gmail.com',
        github: 'https://github.com/Momoko-YANG'
    },
    languages: {
        chinese: '母语',
        english: '流利', 
        japanese: '熟练',
        french: '学习中（基础打招呼）'
    }
};

// 技能模板
const SKILLS_TEMPLATE = {
    programming: [
        'Python - 数据分析和机器学习',
        'R语言 - 统计计算和时间序列分析', 
        'Java - 面向对象编程',
        'SQL - 数据库查询',
        'Excel - 金融建模',
        'Stata - 计量经济学分析',
        '前端开发 - HTML/CSS/JavaScript基础'
    ],
    analysis: [
        '统计学理论与应用',
        '金融数据分析',
        '时间序列分析',
        '经济模型构建',
        '计量经济学方法'
    ],
    ml: [
        '机器学习算法与应用',
        '深度学习理论与实践',
        '数据挖掘与特征工程',
        '大模型相关知识学习',
        '统计学习与模式识别'
    ]
};

// 语言检测器 - 优化版本
class LanguageDetector {
    static #charRanges = {
        chinese: [[0x4E00, 0x9FFF], [0x3400, 0x4DBF]],
        japanese: [[0x3040, 0x309F], [0x30A0, 0x30FF]],
        english: [[65, 90], [97, 122]]
    };

    static #commonWords = {
        ja: /^(はい|いいえ|こんにちは|ありがとう|すみません|さようなら)/,
        en: /^(yes|no|hello|hi|thanks|bye|what|how|when|where|why)/i,
        zh: /^(你好|谢谢|再见|什么|怎么|为什么|哪里)/
    };

    static detectLanguage(text) {
        if (!text || typeof text !== 'string') return CONSTANTS.LANGUAGES.ZH;

        const stats = this.#analyzeText(text);
        if (stats.total === 0) return CONSTANTS.LANGUAGES.ZH;

        const ratios = {
            chinese: stats.chinese / stats.total,
            japanese: stats.japanese / stats.total,
            english: stats.english / stats.total
        };

        if (ratios.japanese > 0.1) return CONSTANTS.LANGUAGES.JA;
        if (ratios.english > 0.8 && stats.chinese === 0 && stats.japanese === 0) {
            return CONSTANTS.LANGUAGES.EN;
        }

        return CONSTANTS.LANGUAGES.ZH;
    }

    static detectLanguageAdvanced(text) {
        for (const [lang, pattern] of Object.entries(this.#commonWords)) {
            if (pattern.test(text.trim())) return lang;
        }
        return this.detectLanguage(text);
    }

    static #analyzeText(text) {
        const stats = { chinese: 0, japanese: 0, english: 0, total: 0 };

        for (const char of text) {
            const code = char.charCodeAt(0);
            
            if (this.#isInRange(code, this.#charRanges.chinese)) stats.chinese++;
            else if (this.#isInRange(code, this.#charRanges.japanese)) stats.japanese++;
            else if (this.#isInRange(code, this.#charRanges.english)) stats.english++;

            if (code > 32 && code < 127 || code > 0x3000) stats.total++;
        }

        return stats;
    }

    static #isInRange(code, ranges) {
        return ranges.some(([start, end]) => code >= start && code <= end);
    }
}

// 响应生成器 - 优化版本
class ResponseGenerator {
    static #keywords = {
        skills: ['技能', '技术', '会什么', '能力', 'skill', 'technology', 'スキル', '技術'],
        contact: ['联系', '邮箱', 'contact', 'email', '連絡', 'メール', 'コンタクト'],
        education: ['教育', '学校', '大学', '学历', 'education', 'school', 'university'],
        projects: ['项目', '作品', '研究', 'project', 'portfolio', 'research', 'プロジェクト', '作品', '研究'],
        hobbies: ['爱好', '兴趣', '喜欢', '运动', '音乐', '阅读', '美食', 'hobby', 'interest', 'like', 'sports', 'music', 'reading', 'food', '趣味', '好き', '運動', '音楽', '読書', '料理'],
        aiAssistant: ['你是谁', '你叫什么', '你能做什么', '你的功能', 'AI能力', 'capabilities', 'who are you', 'what can you do', 'introduce', 'あなたは誰', '何ができますか', '機能']
    };

    static #genericResponses = {
        greeting: {
            zh: ['你好！我是Momoko的AI助手 👋 很高兴与你对话！有什么可以帮助你的吗？'],
            en: ['Hello! I\'m Momoko\'s AI assistant 👋 Nice to meet you! How can I help?'],
            ja: ['こんにちは！私はMomokoのAIアシスタントです 👋 お会いできて嬉しいです！']
        },
        farewell: {
            zh: ['再见！感谢与我的对话 😊 随时欢迎回来！'],
            en: ['Goodbye! Thanks for chatting 😊 Come back anytime!'],
            ja: ['さようなら！会話ありがとうございました 😊 またお越しください！']
        },
        thanks: {
            zh: ['不客气！能帮到你我很开心 😊'],
            en: ['You\'re welcome! Happy to help 😊'],
            ja: ['どういたしまして！お役に立てて嬉しいです 😊']
        },
        unknown: {
            zh: ['这是个有趣的问题！让我想想...你可以问我关于Momoko的技能、项目或联系方式。'],
            en: ['That\'s an interesting question! You can ask me about Momoko\'s skills, projects, or contact info.'],
            ja: ['面白い質問ですね！Momokoのスキル、プロジェクト、連絡先について聞いてください。']
        }
    };

    static generateResponse(input, language = CONSTANTS.LANGUAGES.ZH) {
        const lowerInput = input.toLowerCase().trim();
        
        // 检查精确匹配
        const exactMatch = this.#getExactMatch(lowerInput, language);
        if (exactMatch) return exactMatch;

        // 检查关键词匹配
        const keywordMatch = this.#getKeywordMatch(lowerInput, language);
        if (keywordMatch) return keywordMatch;

        // 返回通用回复
        return this.#getRandomResponse('unknown', language);
    }

    static #getExactMatch(input, language) {
        const exactMatches = {
            '你好': { type: 'greeting', lang: CONSTANTS.LANGUAGES.ZH },
            '再见': { type: 'farewell', lang: CONSTANTS.LANGUAGES.ZH },
            '谢谢': { type: 'thanks', lang: CONSTANTS.LANGUAGES.ZH },
            'hello': { type: 'greeting', lang: CONSTANTS.LANGUAGES.EN },
            'hi': { type: 'greeting', lang: CONSTANTS.LANGUAGES.EN },
            'bye': { type: 'farewell', lang: CONSTANTS.LANGUAGES.EN },
            'thanks': { type: 'thanks', lang: CONSTANTS.LANGUAGES.EN },
            'こんにちは': { type: 'greeting', lang: CONSTANTS.LANGUAGES.JA },
            'さようなら': { type: 'farewell', lang: CONSTANTS.LANGUAGES.JA },
            'ありがとう': { type: 'thanks', lang: CONSTANTS.LANGUAGES.JA }
        };

        const match = exactMatches[input];
        if (match) {
            return this.#getRandomResponse(match.type, match.lang);
        }
        return null;
    }

    static #getKeywordMatch(input, language) {
        for (const [category, keywords] of Object.entries(this.#keywords)) {
            if (keywords.some(keyword => input.includes(keyword.toLowerCase()))) {
                return this.#generateCategoryResponse(category, language);
            }
        }
        return null;
    }

    static #generateCategoryResponse(category, language) {
        const templates = {
            skills: {
                zh: (info) => `🎓 **${info.name}的专业技能：**

**📊 经济学专业**
• 本科：${info.education.bachelor}
• 硕士：${info.education.master}
• 专业方向：${info.education.field}
• 细分领域：${info.education.specialization}

**📈 数据分析技能**
${info.skills.analysis.map(skill => `• ${skill}`).join('\n')}

**💻 编程技能**
${info.skills.programming.map(skill => `• ${skill}`).join('\n')}

**🌍 语言能力**
• 中文 - ${info.languages.chinese}
• 英文 - ${info.languages.english}
• 日文 - ${info.languages.japanese}
• 法语 - ${info.languages.french}

**🤖 机器学习技能**
${info.skills.ml.map(skill => `• ${skill}`).join('\n')}

专注于${info.education.specialization}与机器学习的结合应用！`,

                en: (info) => `💻 **${info.name}'s Professional Skills:**

**📈 Data Analysis Skills**
${info.skills.analysis.map(skill => `• ${skill}`).join('\n')}

**💻 Programming Skills**
${info.skills.programming.map(skill => `• ${skill}`).join('\n')}

**🌍 Language Skills**
• Chinese - ${info.languages.chinese}
• English - ${info.languages.english}
• Japanese - ${info.languages.japanese}
• French - ${info.languages.french}

**🤖 Machine Learning Skills**
${info.skills.ml.map(skill => `• ${skill}`).join('\n')}

Focused on combining ${info.education.specialization} with Machine Learning applications!`,

                ja: (info) => `🎓 **${info.name}の専門スキル：**

**📊 経済学専攻**
• 学士：${info.education.bachelor}
• 修士：${info.education.master}
• 分野：${info.education.field}
• 専門：${info.education.specialization}

**📈 データ分析スキル**
${info.skills.analysis.map(skill => `• ${skill}`).join('\n')}

**💻 プログラミングスキル**
${info.skills.programming.map(skill => `• ${skill}`).join('\n')}

**🌍 言語能力**
• 中国語 - ${info.languages.chinese}
• 英語 - ${info.languages.english}
• 日本語 - ${info.languages.japanese}
• フランス語 - ${info.languages.french}

**🤖 機械学習スキル**
${info.skills.ml.map(skill => `• ${skill}`).join('\n')}

${info.education.specialization}と機械学習の結合応用に専念しています！`
            },

            contact: {
                zh: (info) => `📞 **联系${info.name}的方式：**

**📧 邮箱联系**
• 主邮箱：${info.contact.email}
• 适合：技术讨论、合作洽谈、面试邀请

**💻 技术交流**
• GitHub：${info.contact.github}
• 查看开源项目和代码贡献

**⚡ 响应时间**
• 邮箱：24小时内回复

欢迎技术交流和合作！🤝`,

                en: (info) => `📞 **Contact ${info.name}:**

**📧 Email**
• Main: ${info.contact.email}
• For: Tech discussion, collaboration, interviews

**💻 Tech Exchange**
• GitHub: ${info.contact.github}
• Check out open source projects

**⚡ Response Time**
• Email: Within 24 hours

Welcome tech exchanges and collaboration! 🤝`,

                ja: (info) => `📞 **${info.name}への連絡方法：**

**📧 メール**
• メインアドレス：${info.contact.email}
• 用途：技術討論、協力、面接招待

**💻 技術交流**
• GitHub：${info.contact.github}
• オープンソースプロジェクトを確認

**⚡ 応答時間**
• メール：24時間以内に返信

技術交流と協力を歓迎します！🤝`
            }
        };

        const template = templates[category]?.[language];
        if (template) {
            const info = {
                ...BASE_INFO,
                skills: SKILLS_TEMPLATE
            };
            return template(info);
        }
        return null;
    }

    static #getRandomResponse(type, language) {
        const responses = this.#genericResponses[type]?.[language] || this.#genericResponses[type]?.[CONSTANTS.LANGUAGES.ZH];
        return responses ? responses[Math.floor(Math.random() * responses.length)] : '';
    }
}

// 工具类
class Utils {
    static decodeHtmlEntities(text) {
        if (!text || typeof text !== 'string') return text;
        
        try {
            const textarea = document.createElement('textarea');
            textarea.innerHTML = text;
            let decoded = textarea.value;
            
            if (decoded === text) {
                for (const [entity, char] of Object.entries(HTML_ENTITIES)) {
                    decoded = decoded.replace(new RegExp(entity, 'g'), char);
                }
                
                decoded = decoded
                    .replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(parseInt(dec, 10)))
                    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
            }
            
            return decoded;
        } catch (error) {
            console.error('decodeHtmlEntities error:', error);
            return text;
        }
    }

    static escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    static formatMessage(message) {
        try {
            let formatted = this.decodeHtmlEntities(message);
            
            formatted = formatted
                .replace(/(https?:\/\/[^\s<>]+)/g, (match) => {
                    const decodedUrl = this.decodeHtmlEntities(match);
                    return `<a href="${decodedUrl}" target="_blank" rel="noopener noreferrer">${decodedUrl}</a>`;
                })
                .replace(/\n/g, '<br>')
                .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
                .replace(/\*([^*]+)\*/g, '<em>$1</em>')
                .replace(/• /g, '<span style="color: var(--color-accent);">•</span> ');
            
            return formatted;
        } catch (error) {
            console.error('formatMessage error:', error);
            return this.decodeHtmlEntities(message).replace(/\n/g, '<br>');
        }
    }

    static getCurrentTime() {
        return new Date().toLocaleTimeString('zh-CN', {
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    static getElement(selector) {
        return document.querySelector(selector);
    }

    static getElements(selector) {
        return document.querySelectorAll(selector);
    }
}

// DOM管理器
class DOMManager {
    static showElement(selector) {
        const element = Utils.getElement(selector);
        if (element) element.style.display = 'block';
    }

    static hideElement(selector) {
        const element = Utils.getElement(selector);
        if (element) element.style.display = 'none';
    }

    static showFlexElement(selector) {
        const element = Utils.getElement(selector);
        if (element) element.style.display = 'flex';
    }

    static addClass(selector, className) {
        const element = Utils.getElement(selector);
        if (element) element.classList.add(className);
    }

    static removeClass(selector, className) {
        const element = Utils.getElement(selector);
        if (element) element.classList.remove(className);
    }

    static setValue(selector, value) {
        const element = Utils.getElement(selector);
        if (element) element.value = value;
    }

    static focus(selector) {
        const element = Utils.getElement(selector);
        if (element) element.focus();
    }
}

// 优化版聊天机器人主类
class OptimizedMomokoChatbot {
    constructor() {
        this.isOpen = false;
        this.messageHistory = [];
        this.isThinking = false;
        this.lastTopic = null;
        this.responseCache = new Map();
        this.init();
    }

    init() {
        this.bindEvents();
        this.showNotificationAfterDelay();
        this.initWelcomeMessage();
    }

    bindEvents() {
        const trigger = Utils.getElement(CONSTANTS.SELECTORS.TRIGGER);
        if (!trigger) {
            console.warn('聊天机器人HTML元素未找到');
            return;
        }

        trigger.addEventListener('click', () => this.toggle());
        Utils.getElement(CONSTANTS.SELECTORS.CLOSE)?.addEventListener('click', () => this.close());
        Utils.getElement(CONSTANTS.SELECTORS.SEND)?.addEventListener('click', () => this.sendMessage());

        const input = Utils.getElement(CONSTANTS.SELECTORS.INPUT);
        if (input) {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.sendMessage();
                }
            });

            let typingTimer;
            input.addEventListener('input', (e) => {
                clearTimeout(typingTimer);
                if (e.target.value.length > 3) {
                    typingTimer = setTimeout(() => this.showInputThinking(), CONSTANTS.TIMING.TYPING_DELAY);
                } else {
                    this.hideInputThinking();
                }
            });
        }

        Utils.getElements('.quick-reply').forEach(button => {
            button.addEventListener('click', () => {
                const message = button.getAttribute('data-message');
                this.addUserMessage(message);
                this.processQuickReply(message);
                this.hideQuickReplies();
            });
        });

        document.addEventListener('click', (e) => {
            const container = Utils.getElement(CONSTANTS.SELECTORS.CONTAINER);
            if (this.isOpen && container && !container.contains(e.target) && !trigger.contains(e.target)) {
                this.close();
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) this.close();
        });
    }

    toggle() {
        this.isOpen ? this.close() : this.open();
    }

    open() {
        const container = Utils.getElement(CONSTANTS.SELECTORS.CONTAINER);
        const trigger = Utils.getElement(CONSTANTS.SELECTORS.TRIGGER);
        const notification = Utils.getElement(CONSTANTS.SELECTORS.NOTIFICATION);

        if (!container || !trigger) return;

        DOMManager.addClass(CONSTANTS.SELECTORS.CONTAINER, 'show');
        trigger.style.display = 'none';
        if (notification) notification.style.display = 'none';
        this.isOpen = true;

        setTimeout(() => DOMManager.focus(CONSTANTS.SELECTORS.INPUT), CONSTANTS.TIMING.FOCUS_DELAY);

        if (this.messageHistory.length <= 1) {
            this.showQuickReplies();
        }
    }

    close() {
        const container = Utils.getElement(CONSTANTS.SELECTORS.CONTAINER);
        const trigger = Utils.getElement(CONSTANTS.SELECTORS.TRIGGER);

        if (!container || !trigger) return;

        DOMManager.removeClass(CONSTANTS.SELECTORS.CONTAINER, 'show');
        setTimeout(() => trigger.style.display = 'flex', CONSTANTS.TIMING.ANIMATION_DURATION);
        this.isOpen = false;
        this.hideInputThinking();
    }

    sendMessage() {
        const input = Utils.getElement(CONSTANTS.SELECTORS.INPUT);
        if (!input) return;

        const message = input.value.trim();
        if (message && !this.isThinking) {
            this.addUserMessage(message);
            DOMManager.setValue(CONSTANTS.SELECTORS.INPUT, '');
            this.hideInputThinking();
            this.processMessage(message);
            this.hideQuickReplies();
        }
    }

    addUserMessage(message) {
        const container = Utils.getElement(CONSTANTS.SELECTORS.MESSAGES);
        if (!container) return;

        const messageDiv = document.createElement('div');
        messageDiv.className = 'message user-message message-sending';
        messageDiv.innerHTML = `
            <div class="message-avatar-container">
                <div class="message-avatar">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,14C16.42,14 20,15.79 20,18V20H4V18C4,15.79 7.58,14 12,14Z"/>
                    </svg>
                </div>
            </div>
            <div class="message-content">
                <div class="content-text">
                    <p>${Utils.escapeHtml(message)}</p>
                </div>
            </div>
            <span class="message-time">${Utils.getCurrentTime()}</span>
        `;

        container.appendChild(messageDiv);
        this.scrollToBottom();
        this.messageHistory.push({ role: 'user', content: message });
    }

    async processQuickReply(message) {
        console.log('🚀 快速回复模式：优先使用本地预设内容');
        
        this.isThinking = true;
        this.showAIStatus('Generating quick response...');
        this.showTypingIndicator();

        const baseDelay = 300 + Math.random() * 300; // 更快的响应时间

        try {
            // 优先使用本地预设内容
            const localResponse = this.handleQuickReplyResponse(message);
            
            if (localResponse) {
                console.log('✅ 快速回复：使用本地预设内容');
                console.log(`📝 本地回复长度: ${localResponse.length} 字符`);
            } else {
                // 如果没有找到预设内容，使用通用本地回复
                const language = LanguageDetector.detectLanguageAdvanced(message);
                const fallbackResponse = ResponseGenerator.generateResponse(message, language);
                console.log('🔄 快速回复：使用通用本地回复');
                console.log(`🌐 检测语言: ${language}`);
                console.log(`📝 本地回复长度: ${fallbackResponse.length} 字符`);
                
                setTimeout(() => {
                    this.hideTypingIndicator();
                    this.hideAIStatus();
                    this.addBotMessage(fallbackResponse);
                    this.isThinking = false;
                }, baseDelay);
                return;
            }

            setTimeout(() => {
                this.hideTypingIndicator();
                this.hideAIStatus();
                this.addBotMessage(localResponse);
                this.isThinking = false;
            }, baseDelay);

        } catch (error) {
            console.error('快速回复处理出错:', error);
            setTimeout(() => {
                this.hideTypingIndicator();
                this.hideAIStatus();
                this.addBotMessage('抱歉，快速回复暂时不可用 😅 请稍后再试！');
                this.isThinking = false;
            }, baseDelay);
        }
    }

    async processMessage(message) {
        const cacheKey = message.toLowerCase().trim();
        if (this.responseCache.has(cacheKey)) {
            this.addBotMessage(this.responseCache.get(cacheKey));
            return;
        }

        this.isThinking = true;
        this.showAIStatus('AI is thinking...');
        this.showTypingIndicator();

        const baseDelay = 1000 + Math.random() * 1000;

        try {
            let response;
            
            // 检查是否是快速回复按钮的消息，优先使用本地预设内容
            const isQuickReply = this.isQuickReplyMessage(message);
            
            if (isQuickReply) {
                console.log('🚀 检测到快速回复按钮，优先使用本地预设内容');
                response = this.handleQuickReplyResponse(message);
            } else {
                try {
                    console.log('🤖 尝试使用 gpt-4o-mini 大模型...');
                    response = await this.callBackendAPI(message);
                    
                    if (response && response.length > 10) {
                        console.log('✅ gpt-4o-mini 响应成功');
                    } else {
                        console.log('⚠️ gpt-4o-mini 响应质量不佳，使用本地智能回复');
                        response = this.handleFallbackResponse(message);
                    }
                } catch (apiError) {
                    console.log('❌ gpt-4o-mini 调用失败，使用本地智能回复');
                    response = this.handleFallbackResponse(message);
                }
            }

            if (message.length < 50) {
                this.responseCache.set(cacheKey, response);
            }

            setTimeout(() => {
                this.hideTypingIndicator();
                this.hideAIStatus();
                this.addBotMessage(response);
                this.isThinking = false;
            }, baseDelay);

        } catch (error) {
            console.error('处理消息时出错:', error);
            setTimeout(() => {
                this.hideTypingIndicator();
                this.hideAIStatus();
                this.addBotMessage('Sorry, AI model is temporarily unavailable 😅 Please try again later!');
                this.isThinking = false;
            }, baseDelay);
        }
    }

    isQuickReplyMessage(message) {
        // 定义快速回复按钮的消息
        const quickReplyMessages = [
            'introduce your ai capabilities',
            'tell me about your education background',
            'how about your skills?',
            'あなたのスキルについて教えて',
            'how to contact momoko',
            'tell me about your hobbies and interests'
        ];
        
        const messageLower = message.toLowerCase().trim();
        return quickReplyMessages.some(quickMsg => 
            messageLower.includes(quickMsg.toLowerCase()) || 
            quickMsg.toLowerCase().includes(messageLower)
        );
    }

    handleQuickReplyResponse(message) {
        const messageLower = message.toLowerCase().trim();
        
        // 快速回复的本地预设内容
        const quickReplyResponses = {
            'introduce your ai capabilities': {
                zh: `🤖 **Momoko AI助手能力：**

**🧠 智能对话**
• 多语言支持（中英日）
• 自然语言理解
• 上下文记忆
• 个性化回复

**💼 专业领域**
• Statistical Finance + 机器学习
• 数据分析与建模
• 编程技能（Python/R/Java）

**⚡ 技术特点**
• 快速响应（本地+云端混合）
• 智能缓存
• 多模型支持

我可以为您提供专业、简洁的回答！✨`,
                
                en: `🤖 **Momoko AI Assistant Capabilities:**

**🧠 Intelligent Conversation**
• Multilingual Support (Chinese/English/Japanese)
• Natural Language Understanding
• Context Memory
• Personalized Responses

**💼 Professional Domain**
• Statistical Finance + Machine Learning
• Data Analysis and Modeling
• Programming Skills (Python/R/Java)

**⚡ Technical Features**
• Fast Response (Local + Cloud Hybrid)
• Smart Caching
• Multi-model Support

I can provide professional, concise answers! ✨`,
                
                ja: `🤖 **Momoko AIアシスタントの能力：**

**🧠 インテリジェント会話**
• 多言語サポート（中国語/英語/日本語）
• 自然言語理解
• コンテキスト記憶
• パーソナライズ応答

**💼 専門分野**
• Statistical Finance + 機械学習
• データ分析とモデリング
• プログラミングスキル（Python/R/Java）

**⚡ 技術的特徴**
• 高速応答（ローカル+クラウドハイブリッド）
• スマートキャッシュ
• マルチモデルサポート

専門的で簡潔な回答を提供できます！✨`
            },
            
            'tell me about your education background': {
                zh: `🎓 **Momoko教育背景：**

**📚 本科**
• 吉林大学经济学院经济学系
• 985高校，经济学领域享有很高声誉
• 美赛ICM获得M奖

**🎓 硕士**
• 早稻田大学经济学研究科
• 专业：Statistical Finance（统计金融）
• 日本顶尖私立大学

**🔬 专业特色**
• 前沿交叉学科：统计学+金融学
• 应用领域：量化投资、风险管理、金融预测

**📈 学习历程**
• 2023年：开始Python编程
• 2024年：掌握R、Python、Java
• 持续学习：机器学习与深度学习

为数据科学和机器学习发展奠定坚实基础！✨`,
                
                en: `🎓 **Momoko's Educational Background:**

**📚 Undergraduate**
• School of Economics, Jilin University
• 985 university with excellent reputation in economics
• Won M Award in ICM competition

**🎓 Graduate**
• Graduate School of Economics, Waseda University
• Specialization: Statistical Finance
• Top private university in Japan

**🔬 Academic Focus**
• Cutting-edge interdisciplinary field: Statistics + Finance
• Applications: Quantitative investment, risk management, financial forecasting

**📈 Learning Journey**
• 2023: Started Python programming
• 2024: Mastered R, Python, Java
• Continuous Learning: Machine learning and deep learning

Provides solid foundation for data science and machine learning development! ✨`,
                
                ja: `🎓 **Momokoの教育背景：**

**📚 学士課程**
• 吉林大学経済学院経済学科
• 経済学分野で高い評価を得る985大学
• ICMコンペティションでM賞獲得

**🎓 修士課程**
• 早稲田大学大学院経済学研究科
• 専門：Statistical Finance（統計金融）
• 日本を代表する私立大学

**🔬 学術的焦点**
• 最先端の学際分野：統計学+金融学
• 応用：定量投資、リスク管理、金融予測

**📈 学習履歴**
• 2023年：Pythonプログラミング開始
• 2024年：R、Python、Javaを習得
• 継続学習：機械学習とディープラーニング

データサイエンスと機械学習分野での発展に堅実な基盤を提供！✨`
            },
            
            'how about your skills?': {
                zh: `🚀 **Momoko专业技能：**

**💻 编程语言**
• Python：数据分析/机器学习（pandas/numpy/scikit-learn）
• R语言：统计计算/时间序列分析
• Java：面向对象编程
• SQL：数据库查询和数据分析

**📊 数据分析**
• 统计学理论与应用
• 金融数据分析（股票/债券/衍生品）
• 时间序列分析（ARIMA/GARCH）
• 经济模型构建

**🤖 机器学习**
• 机器学习算法（监督/无监督/强化学习）
• 深度学习（神经网络/CNN/RNN/Transformer）
• 数据挖掘（特征工程/模型评估）
• 大模型知识（LLM原理/微调）

**🌍 语言能力**
• 中文：母语，英文：流利，日文：熟练，法语：学习中

**🎯 专业特色**
专注于Statistical Finance与机器学习结合应用！✨`,
                
                en: `🚀 **Momoko's Professional Skills:**

**💻 Programming Languages**
• Python: Data analysis/ML (pandas/numpy/scikit-learn)
• R Language: Statistical computing/time series analysis
• Java: Object-oriented programming
• SQL: Database queries and data analysis

**📊 Data Analysis**
• Statistical Theory and Application
• Financial Data Analysis (stocks/bonds/derivatives)
• Time Series Analysis (ARIMA/GARCH)
• Economic Model Building

**🤖 Machine Learning**
• ML Algorithms (supervised/unsupervised/reinforcement)
• Deep Learning (neural networks/CNN/RNN/Transformer)
• Data Mining (feature engineering/model evaluation)
• Large Language Models (LLM principles/fine-tuning)

**🌍 Language Skills**
• Chinese: Native, English: Fluent, Japanese: Proficient, French: Learning

**🎯 Professional Specialties**
Focused on Statistical Finance + Machine Learning integration! ✨`,
                
                ja: `🚀 **Momokoの専門スキル：**

**💻 プログラミング言語**
• Python：データ分析/機械学習（pandas/numpy/scikit-learn）
• R言語：統計計算/時系列分析
• Java：オブジェクト指向プログラミング
• SQL：データベースクエリとデータ分析

**📊 データ分析**
• 統計学理論と応用
• 金融データ分析（株式/債券/デリバティブ）
• 時系列分析（ARIMA/GARCH）
• 経済モデル構築

**🤖 機械学習**
• 機械学習アルゴリズム（教師あり/教師なし/強化学習）
• ディープラーニング（ニューラルネットワーク/CNN/RNN/Transformer）
• データマイニング（特徴量エンジニアリング/モデル評価）
• 大規模言語モデル（LLM原理/ファインチューニング）

**🌍 言語能力**
• 中国語：母語、英語：流暢、日本語：熟練、フランス語：学習中

**🎯 専門的特徴**
Statistical Finance + 機械学習の統合に専念！✨`
            },
            
            'あなたのスキルについて教えて': {
                zh: `🚀 **Momoko的专业技能详解：**

**💻 编程语言技能**
• Python：数据分析和机器学习，熟练使用pandas、numpy、scikit-learn
• R语言：统计计算和时间序列分析，精通ggplot2、dplyr、forecast
• Java：面向对象编程，具备企业级开发能力
• SQL：数据库查询和数据分析
• 前端开发：HTML/CSS/JavaScript基础

**📊 数据分析技能**
• 统计学理论与应用：掌握描述统计、推断统计
• 金融数据分析：股票、债券、衍生品数据分析
• 时间序列分析：ARIMA、GARCH等模型应用
• 经济模型构建：计量经济学模型开发
• 计量经济学方法：回归分析、假设检验

**🤖 机器学习技能**
• 机器学习算法：监督学习、无监督学习、强化学习
• 深度学习：神经网络、CNN、RNN、Transformer
• 数据挖掘：特征工程、数据预处理、模型评估
• 大模型知识：LLM原理、微调、应用开发
• 统计学习：模式识别、预测建模

**🌍 语言能力**
• 中文：母语水平，专业学术交流
• 英文：流利，国际学术交流能力
• 日文：熟练，在日本学习生活无障碍
• 法语：学习中，基础日常用语

**🎯 专业特色**
专注于Statistical Finance与机器学习的结合应用，在量化投资、风险管理、金融预测等领域有独特优势！✨`,
                
                en: `🚀 **Momoko's Professional Skills:**

**💻 Programming Languages**
• Python: Data analysis and machine learning, proficient in pandas, numpy, scikit-learn
• R Language: Statistical computing and time series analysis, expert in ggplot2, dplyr, forecast
• Java: Object-oriented programming with enterprise development capabilities
• SQL: Database queries and data analysis
• Frontend Development: HTML/CSS/JavaScript basics

**📊 Data Analysis Skills**
• Statistical Theory and Application: Descriptive and inferential statistics
• Financial Data Analysis: Stock, bond, derivative data analysis
• Time Series Analysis: ARIMA, GARCH model applications
• Economic Model Building: Econometric model development
• Econometric Methods: Regression analysis, hypothesis testing

**🤖 Machine Learning Skills**
• Machine Learning Algorithms: Supervised, unsupervised, reinforcement learning
• Deep Learning: Neural networks, CNN, RNN, Transformer
• Data Mining: Feature engineering, data preprocessing, model evaluation
• Large Language Models: LLM principles, fine-tuning, application development
• Statistical Learning: Pattern recognition, predictive modeling

**🌍 Language Skills**
• Chinese: Native level, professional academic communication
• English: Fluent, international academic exchange capabilities
• Japanese: Proficient, barrier-free study and life in Japan
• French: Learning, basic conversational skills

**🎯 Professional Specialties**
Focused on combining Statistical Finance with machine learning applications, with unique advantages in quantitative investment, risk management, financial forecasting! ✨`,
                
                ja: `🚀 **Momokoの専門スキル：**

**💻 プログラミング言語**
• Python：データ分析と機械学習、pandas、numpy、scikit-learnに精通
• R言語：統計計算と時系列分析、ggplot2、dplyr、forecastに専門的
• Java：オブジェクト指向プログラミング、エンタープライズ開発能力
• SQL：データベースクエリとデータ分析
• フロントエンド開発：HTML/CSS/JavaScript基礎

**📊 データ分析スキル**
• 統計学理論と応用：記述統計、推測統計を習得
• 金融データ分析：株式、債券、デリバティブデータ分析
• 時系列分析：ARIMA、GARCHモデル応用
• 経済モデル構築：計量経済学モデル開発
• 計量経済学手法：回帰分析、仮説検定

**🤖 機械学習スキル**
• 機械学習アルゴリズム：教師あり学習、教師なし学習、強化学習
• データマイニング：特徴量エンジニアリング、データ前処理、モデル評価
• 大規模言語モデル：LLM原理、ファインチューニング、アプリケーション開発
• 統計学習：パターン認識、予測モデリング

**🌍 言語能力**
• 中国語：母語レベル、専門的な学術交流
• 英語：流暢、国際的な学術交流能力
• 日本語：熟練、日本での学習・生活に支障なし
• フランス語：学習中、基本的な日常会話

**🎯 専門的特徴**
Statistical Financeと機械学習の結合応用に専念し、定量投資、リスク管理、金融予測などの分野で独特な利点があります！✨`
            },
            
            'how to contact momoko': {
                zh: `📞 **联系Momoko：**

**📧 邮箱**
• yangmengyuan1215@gmail.com
• 适合：技术讨论、合作洽谈、面试邀请
• 响应时间：24小时内

**💻 技术交流**
• GitHub：https://github.com/Momoko-YANG
• 查看开源项目和代码贡献

**🤝 合作领域**
• 机器学习项目合作
• 数据分析咨询
• 学术研究交流

**⚡ 快速响应**
• 工作日：几小时内回复
• 周末：24小时内回复

欢迎技术交流和合作！🤝✨`,
                
                en: `📞 **Contact Momoko:**

**📧 Email**
• yangmengyuan1215@gmail.com
• For: Technical discussions, collaboration, interviews
• Response: Within 24 hours

**💻 Technical Exchange**
• GitHub: https://github.com/Momoko-YANG
• Check out open source projects

**🤝 Collaboration Areas**
• Machine learning project collaboration
• Data analysis consulting
• Academic research exchange

**⚡ Quick Response**
• Weekdays: Within hours
• Weekends: Within 24 hours

Welcome technical exchanges and collaboration! 🤝✨`,
                
                ja: `📞 **Momokoへの連絡：**

**📧 メール**
• yangmengyuan1215@gmail.com
• 用途：技術討論、協力、面接
• 応答：24時間以内

**💻 技術交流**
• GitHub：https://github.com/Momoko-YANG
• オープンソースプロジェクトを確認

**🤝 協力分野**
• 機械学習プロジェクト協力
• データ分析コンサルティング
• 学術研究交流

**⚡ 迅速な応答**
• 平日：数時間以内
• 週末：24時間以内

技術交流と協力を歓迎します！🤝✨`
            },
            
            'tell me about your hobbies and interests': {
                zh: `🎯 **Momoko的兴趣爱好：**

**🏃‍♀️ 运动健身**
• 长跑：2023年完成富士山马拉松（全马42.195公里）
• 网球：享受运动带来的快乐
• 展现极强的毅力和体能

**🎵 音乐品味**
• 摇滚音乐爱好者
• 最爱：Guns N' Roses、Megadeth
• 经典乐队的忠实粉丝

**📚 文学阅读**
• 喜欢东亚文学
• 最爱作家：张爱玲、白先勇
• 享受文学带来的思考

**🍳 烹饪技能**
• 会做泰国料理
• 对东南亚美食有浓厚兴趣
• 喜欢尝试不同口味

**🌤️ 个人偏好**
• 喜欢温暖宜人的气候
• 不喜欢寒冷的冬天
• 追求舒适的生活环境

热爱生活，享受运动与美食！✨`,
                
                en: `🎯 **Momoko's Hobbies \& Interests:**

**🏃‍♀️ Sports & Fitness**
• Long-distance running: Completed 2023 Fuji Mountain Marathon (42.195km)
• Tennis: Enjoy the joy of sports
• Demonstrates exceptional perseverance and fitness

**🎵 Music Taste**
• Rock music enthusiast
• Favorites: Guns N' Roses, Megadeth
• Loyal fan of classic bands

**📚 Literature**
• Likes East Asian literature
• Favorite authors: Eileen Chang, Pai Hsien-yung
• Enjoys literary contemplation

**🍳 Culinary Skills**
• Can cook Thai food
• Strong interest in Southeast Asian cuisine
• Loves trying different flavors

**🌤️ Personal Preferences**
• Prefers warm, pleasant climates
• Dislikes cold winters
• Pursues comfortable living environment

Loves life, enjoys sports and food! ✨`,
                
                ja: `🎯 **Momokoの趣味と興味：**

**🏃‍♀️ スポーツ・フィットネス**
• 長距離ランニング：2023年富士山マラソン完走（42.195km）
• テニス：スポーツの楽しさを享受
• 卓越した忍耐力と体力を証明

**🎵 音楽の好み**
• ロック音楽愛好者
• お気に入り：Guns N' Roses、Megadeth
• クラシックバンドの忠実なファン

**📚 文学**
• 東アジア文学が好き
• お気に入りの作家：張愛玲、白先勇
• 文学的な思索を楽しむ

**🍳 料理スキル**
• タイ料理が作れる
• 東南アジア料理に強い関心
• 様々な味を試すのが好き

**🌤️ 個人的な好み**
• 暖かく快適な気候を好む
• 寒い冬が嫌い
• 快適な生活環境を追求

人生を愛し、スポーツと料理を楽しむ！✨`
            }
        };
        
        // 检测语言
        const language = LanguageDetector.detectLanguageAdvanced(message);
        
        // 查找匹配的快速回复
        for (const [key, responses] of Object.entries(quickReplyResponses)) {
            if (messageLower.includes(key.toLowerCase()) || key.toLowerCase().includes(messageLower)) {
                const response = responses[language] || responses['en'];
                console.log(`🚀 使用快速回复预设内容 (${language})`);
                return response;
            }
        }
        
        // 如果没有找到匹配的快速回复，返回null让调用方处理
        console.log('🔄 未找到匹配的快速回复');
        return null;
    }

    handleFallbackResponse(message) {
        const language = LanguageDetector.detectLanguageAdvanced(message);
        const localResponse = ResponseGenerator.generateResponse(message, language);
        
        console.log('🔄 切换到本地智能回复模式');
        console.log(`🌐 检测语言: ${language}`);
        console.log(`📝 本地回复长度: ${localResponse.length} 字符`);
        
        const fallbackResponses = {
            zh: `抱歉，AI大模型暂时不可用 😅 让我用本地知识为你回答：\n\n${localResponse}`,
            en: `Sorry, AI model is temporarily unavailable 😅 Let me answer with local knowledge:\n\n${localResponse}`,
            ja: `申し訳ありません、AIモデルが一時的に利用できません 😅 ローカル知識でお答えします：\n\n${localResponse}`
        };

        return fallbackResponses[language] || fallbackResponses.zh;
    }

    async callBackendAPI(message) {
        const apiUrl = window.appConfig?.apiUrl || 'http://127.0.0.1:5000/api/chat';
        
        console.log('🔗 当前API配置:', {
            apiUrl: apiUrl,
            model: CONSTANTS.MODELS.GPT4O_MINI,
            disableBackendAPI: window.appConfig?.disableBackendAPI
        });
        
        if (!apiUrl || window.appConfig?.disableBackendAPI) {
            console.log('❌ 后端API未配置或已禁用');
            throw new Error('后端API未配置或已禁用');
        }

        try {
            console.log('🤖 调用 gpt-4o-mini (固定token: 400)');
            
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: message,
                    model: CONSTANTS.MODELS.GPT4O_MINI,
                    max_tokens: 400,  // 使用固定的400 token
                    temperature: 0.7
                }),
                timeout: CONSTANTS.TIMING.API_TIMEOUT
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            
            if (data.error) {
                throw new Error(data.error);
            }

            if (!data.response || data.response.length < 5) {
                throw new Error('AI回复质量不佳');
            }

            console.log('✅ gpt-4o-mini 响应成功');
            return data.response;
            
        } catch (error) {
            console.log(`❌ API调用失败: ${error.message}`);
            throw error;
        }
    }

    addBotMessage(message) {
        const container = Utils.getElement(CONSTANTS.SELECTORS.MESSAGES);
        if (!container) return;

        this.identifyTopic(message);

        const messageDiv = document.createElement('div');
        messageDiv.className = 'message bot-message';
        messageDiv.innerHTML = `
            <div class="message-avatar-container">
                <div class="avatar-ring"></div>
                <div class="message-avatar">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2Z"/>
                    </svg>
                </div>
            </div>
            <div class="message-content">
                <div class="message-glow"></div>
                <div class="content-text"></div>
            </div>
            <span class="message-time">${Utils.getCurrentTime()}</span>
        `;

        const contentText = messageDiv.querySelector('.content-text');
        if (contentText) {
            contentText.innerHTML = Utils.formatMessage(message);
        }

        container.appendChild(messageDiv);
        this.scrollToBottom();
        this.messageHistory.push({ role: 'assistant', content: message });

        this.typewriterEffect(contentText);
    }

    identifyTopic(message) {
        const topics = ['skills', 'projects', 'contact', 'education', 'hobbies'];
        const messageLower = message.toLowerCase();

        for (const topic of topics) {
            const keywords = ResponseGenerator._keywords?.[topic] || [];
            if (keywords.some(keyword => messageLower.includes(keyword.toLowerCase()))) {
                this.lastTopic = topic;
                break;
            }
        }
    }

    typewriterEffect(element) {
        const html = element.innerHTML;
        element.innerHTML = '';
        element.style.opacity = '1';

        let index = 0;
        const speed = 20;

        const type = () => {
            if (index < html.length) {
                if (html.charAt(index) === '<') {
                    const tagEnd = html.indexOf('>', index);
                    if (tagEnd !== -1) {
                        element.insertAdjacentHTML('beforeend', html.substring(index, tagEnd + 1));
                        index = tagEnd + 1;
                    } else {
                        element.insertAdjacentHTML('beforeend', html.charAt(index));
                        index++;
                    }
                } else {
                    element.insertAdjacentHTML('beforeend', html.charAt(index));
                    index++;
                }
                setTimeout(type, speed);
            }
        };

        try {
            type();
        } catch (error) {
            console.error('typewriterEffect error:', error);
            element.innerHTML = html;
        }
    }

    showTypingIndicator() {
        const container = Utils.getElement(CONSTANTS.SELECTORS.MESSAGES);
        if (!container) return;

        const typingDiv = document.createElement('div');
        typingDiv.className = 'typing-indicator-large typing-message';
        typingDiv.innerHTML = `
            <div class="message-avatar-container">
                <div class="avatar-ring"></div>
                <div class="message-avatar">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2Z"/>
                    </svg>
                </div>
            </div>
            <div class="typing-dots">
                <div class="dot"></div>
                <div class="dot"></div>
                <div class="dot"></div>
            </div>
        `;

        container.appendChild(typingDiv);
        this.scrollToBottom();
    }

    hideTypingIndicator() {
        const typingMessage = Utils.getElement('.typing-message');
        typingMessage?.remove();
    }

    showInputThinking() {
        DOMManager.showFlexElement(CONSTANTS.SELECTORS.INPUT_THINKING);
    }

    hideInputThinking() {
        DOMManager.hideElement(CONSTANTS.SELECTORS.INPUT_THINKING);
    }

    showAIStatus(message) {
        const status = Utils.getElement(CONSTANTS.SELECTORS.AI_STATUS);
        if (status) {
            status.querySelector('span').textContent = message;
            status.style.display = 'flex';
        }
    }

    hideAIStatus() {
        DOMManager.hideElement(CONSTANTS.SELECTORS.AI_STATUS);
    }

    showQuickReplies() {
        DOMManager.showElement(CONSTANTS.SELECTORS.QUICK_REPLIES);
    }

    hideQuickReplies() {
        DOMManager.hideElement(CONSTANTS.SELECTORS.QUICK_REPLIES);
    }

    scrollToBottom() {
        const container = Utils.getElement(CONSTANTS.SELECTORS.MESSAGES);
        if (container) {
            setTimeout(() => {
                container.scrollTop = container.scrollHeight;
            }, 100);
        }
    }

    showNotificationAfterDelay() {
        setTimeout(() => {
            if (!this.isOpen) {
                const notification = Utils.getElement(CONSTANTS.SELECTORS.NOTIFICATION);
                if (notification) {
                    notification.style.display = 'flex';
                    const trigger = Utils.getElement(CONSTANTS.SELECTORS.TRIGGER);
                    if (trigger) {
                        trigger.style.animation = 'swing 0.5s ease-in-out 3';
                    }
                }
            }
        }, CONSTANTS.TIMING.NOTIFICATION_DELAY);
    }

    initWelcomeMessage() {
        this.messageHistory.push({
            role: 'assistant',
            content: 'Welcome message initialized'
        });
    }

    clearHistory() {
        const container = Utils.getElement(CONSTANTS.SELECTORS.MESSAGES);
        if (container) {
            const messages = container.querySelectorAll('.message:not(.welcome-message)');
            messages.forEach(msg => msg.remove());

            this.messageHistory = this.messageHistory.slice(0, 1);
            this.responseCache.clear();
            this.lastTopic = null;
            this.showQuickReplies();
        }
    }

    getHistory() {
        return this.messageHistory;
    }



    getStats() {
        const stats = {
            totalMessages: this.messageHistory.length,
            userMessages: this.messageHistory.filter(m => m.role === 'user').length,
            botMessages: this.messageHistory.filter(m => m.role === 'assistant').length,
            cachedResponses: this.responseCache.size,
            lastTopic: this.lastTopic,
            currentModel: CONSTANTS.MODELS.GPT4O_MINI,
            fixedTokens: 600,
            apiUrl: window.appConfig?.apiUrl || 'http://127.0.0.1:5000/api/chat',
            environment: window.location.hostname === 'localhost' ? '开发环境' : '生产环境',
            isOpen: this.isOpen,
            isThinking: this.isThinking
        };
        
        console.log('📊 聊天机器人状态:', stats);
        return stats;
    }
}

// CSS动画
const chatbotAnimations = `
@keyframes swing {
    0% { transform: rotate(0deg); }
    25% { transform: rotate(-5deg); }
    75% { transform: rotate(5deg); }
    100% { transform: rotate(0deg); }
}

@keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
}

@keyframes pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.05); }
    100% { transform: scale(1); }
}
`;

// 插入样式
const styleElement = document.createElement('style');
styleElement.textContent = chatbotAnimations;
document.head.appendChild(styleElement);

// 全局实例
let momokoChatbot = null;

// 初始化
document.addEventListener('DOMContentLoaded', function () {
    setTimeout(() => {
        const trigger = Utils.getElement(CONSTANTS.SELECTORS.TRIGGER);
        if (trigger) {
            momokoChatbot = new OptimizedMomokoChatbot();
            window.chatbot = momokoChatbot;

            console.log(`
🤖 Momoko AI聊天助手 v5.0 (速度优化版) 已加载！

📊 速度优化特性：
• ⚡ 固定token设置(400) - 提高回复速度
• 🚀 快速回复按钮优先使用本地预设内容
• 🔧 去除动态token计算，减少延迟
• 📦 智能缓存机制，避免重复计算
• 🛡️ 更好的错误处理和降级策略

🔧 当前配置：
• 模型: ${CONSTANTS.MODELS.GPT4O_MINI}
• 固定Token: 400 (优化速度)
• API地址: ${window.appConfig?.apiUrl || 'http://127.0.0.1:5000/api/chat'}
• 环境: ${window.location.hostname === 'localhost' ? '开发环境' : '生产环境'}

💡 可用命令：
• window.chatbot.clearHistory() - 清空对话历史
• window.chatbot.getStats() - 查看统计信息

✨ 现在使用速度优化版进行快速智能对话！
            `);
        } else {
            console.warn('⚠️ 聊天机器人HTML元素未找到');
        }
    }, 1000);
});

// 页面卸载清理
window.addEventListener('beforeunload', () => {
    if (momokoChatbot) {
        momokoChatbot.close();
    }
});

// ============================================================================
// 文件结束 Momoko AI聊天机器人速度优化版 v5.0
// ============================================================================ 