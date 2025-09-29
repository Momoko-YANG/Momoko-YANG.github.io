# website.py - 优化版本
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import os
import json
import html
import re
from datetime import datetime
from typing import Dict, Optional, Tuple
import logging
from pathlib import Path
from functools import lru_cache
from openai import OpenAI

# ================== 配置管理 ==================
class Config:
    """集中管理配置"""
    # Flask配置
    JSON_AS_ASCII = False
    JSONIFY_PRETTYPRINT_REGULAR = False
    
    # CORS配置
    CORS_ORIGINS = ["https://momoko-yang.github.io"]
    CORS_METHODS = ["GET", "POST", "OPTIONS"]
    CORS_HEADERS = ["Content-Type", "Authorization", "X-Requested-With", "Accept"]
    CORS_MAX_AGE = 86400
    
    # OpenAI配置
    OPENAI_MODEL = "gpt-4o-mini"
    DEFAULT_MAX_TOKENS = 600
    DEFAULT_TEMPERATURE = 0.7
    
    # 文件路径
    CONTENT_FILE = Path(__file__).parent / "content.json"
    STATIC_FOLDER = "static"
    
    # 日志配置
    LOG_LEVEL = logging.INFO
    LOG_FORMAT = '%(asctime)s - %(name)s - %(levelname)s - %(message)s'

# ================== 应用初始化 ==================
app = Flask(__name__, static_folder=Config.STATIC_FOLDER)
app.config.from_object(Config)

# 配置CORS
CORS(app, 
     origins=Config.CORS_ORIGINS,
     methods=Config.CORS_METHODS,
     allow_headers=Config.CORS_HEADERS,
     expose_headers=["Content-Type", "X-Total-Count"],
     supports_credentials=False,
     max_age=Config.CORS_MAX_AGE
)

# 配置日志
logging.basicConfig(
    level=Config.LOG_LEVEL,
    format=Config.LOG_FORMAT
)
logger = logging.getLogger(__name__)

# ================== 内容管理 ==================
class ContentManager:
    """管理提示语和本地回复内容"""
    
    def __init__(self, content_file: Path = Config.CONTENT_FILE):
        self.content_file = content_file
        self._content = None
        self._load_content()
    
    def _load_content(self):
        """从外部文件加载内容"""
        try:
            if self.content_file.exists():
                with open(self.content_file, 'r', encoding='utf-8') as f:
                    self._content = json.load(f)
                logger.info(f"成功加载内容文件: {self.content_file}")
            else:
                logger.warning(f"内容文件不存在: {self.content_file}，使用默认内容")
                self._content = self._get_default_content()
        except Exception as e:
            logger.error(f"加载内容文件失败: {e}")
            self._content = self._get_default_content()
    
    def _get_default_content(self) -> Dict:
        """获取默认内容（简化版）"""
        return {
            "system_prompts": {
                "zh": "你是Momoko的AI助手，用于提供专业且个性化的解答与建议。",
                "en": "You are Momoko's AI assistant, providing professional and personalized answers.",
                "ja": "あなたはMomokoのAIアシスタントです。"
            },
            "local_responses": {
                "zh": "你好！我是Momoko的AI助手，很高兴为您服务！",
                "en": "Hello! I'm Momoko's AI Assistant!",
                "ja": "こんにちは！MomokoのAIアシスタントです！"
            }
        }
    
    @lru_cache(maxsize=3)
    def get_system_prompt(self, language: str) -> str:
        """获取系统提示（带缓存）"""
        prompts = self._content.get("system_prompts", {})
        return prompts.get(language, prompts.get('zh', ''))
    
    @lru_cache(maxsize=3)
    def get_local_response(self, language: str) -> str:
        """获取本地回复（带缓存）"""
        responses = self._content.get("local_responses", {})
        return responses.get(language, responses.get('zh', ''))

# ================== 语言检测服务 ==================
class LanguageDetector:
    """语言检测服务"""
    
    # Unicode范围常量
    CHINESE_RANGES = [(0x4E00, 0x9FFF), (0x3400, 0x4DBF)]
    JAPANESE_HIRAGANA = (0x3040, 0x309F)
    JAPANESE_KATAKANA = (0x30A0, 0x30FF)
    ENGLISH_UPPER = (65, 90)
    ENGLISH_LOWER = (97, 122)
    
    @classmethod
    def detect(cls, text: str) -> str:
        """检测文本语言"""
        if not text:
            return 'zh'
        
        stats = cls._analyze_text(text)
        return cls._determine_language(stats)
    
    @classmethod
    def _analyze_text(cls, text: str) -> Dict[str, float]:
        """分析文本字符组成"""
        chinese_chars = 0
        japanese_chars = 0
        english_chars = 0
        total_chars = 0
        
        for char in text:
            code = ord(char)
            
            # 中文字符
            if any(start <= code <= end for start, end in cls.CHINESE_RANGES):
                chinese_chars += 1
            # 日文平假名
            elif cls.JAPANESE_HIRAGANA[0] <= code <= cls.JAPANESE_HIRAGANA[1]:
                japanese_chars += 1
            # 日文片假名
            elif cls.JAPANESE_KATAKANA[0] <= code <= cls.JAPANESE_KATAKANA[1]:
                japanese_chars += 1
            # 英文字母
            elif (cls.ENGLISH_UPPER[0] <= code <= cls.ENGLISH_UPPER[1] or 
                  cls.ENGLISH_LOWER[0] <= code <= cls.ENGLISH_LOWER[1]):
                english_chars += 1
            
            # 统计有效字符
            if code > 32 and (code < 127 or code > 0x3000):
                total_chars += 1
        
        if total_chars == 0:
            return {'chinese': 0, 'japanese': 0, 'english': 0}
        
        return {
            'chinese': chinese_chars / total_chars,
            'japanese': japanese_chars / total_chars,
            'english': english_chars / total_chars,
            'total': total_chars
        }
    
    @staticmethod
    def _determine_language(stats: Dict[str, float]) -> str:
        """根据统计结果确定语言"""
        # 日语优先（如果检测到假名）
        if stats['japanese'] > 0.1:
            return 'ja'
        
        # 纯英文检测
        if stats['english'] > 0.8 and stats['chinese'] == 0:
            return 'en'
        
        # 默认中文
        return 'zh'

# ================== 响应清理服务 ==================
class ResponseCleaner:
    """响应清理服务"""
    
    # 需要移除的系统提示关键词
    SYSTEM_KEYWORDS = [
        "你是Momoko的AI助手", "You are Momoko's AI assistant",
        "あなたはMomokoのAIアシスタントです",
        "User:", "Assistant:", "用户:", "助手:"
    ]
    
    @classmethod
    def clean(cls, response: str, original_message: str, language: str) -> str:
        """清理AI响应"""
        if not response:
            return ""
        
        cleaned = response.strip()
        
        # 移除输入重复
        cleaned = cls._remove_input_echo(cleaned, original_message)
        
        # 移除系统提示
        cleaned = cls._remove_system_prompts(cleaned)
        
        # 清理HTML实体
        cleaned = cls._clean_html_entities(cleaned)
        
        # 格式化
        cleaned = cls._format_response(cleaned, language)
        
        return cleaned
    
    @staticmethod
    def _remove_input_echo(text: str, original: str) -> str:
        """移除可能的输入重复"""
        if text.lower().startswith(original.lower()):
            return text[len(original):].strip()
        return text
    
    @classmethod
    def _remove_system_prompts(cls, text: str) -> str:
        """移除系统提示关键词"""
        for keyword in cls.SYSTEM_KEYWORDS:
            text = text.replace(keyword, '')
        return text.strip()
    
    @staticmethod
    def _clean_html_entities(text: str) -> str:
        """使用内置函数清理HTML实体"""
        # 使用html.unescape进行标准化解码
        cleaned = html.unescape(text)
        
        # 处理可能残留的特殊情况
        cleaned = re.sub(r'&#x([0-9a-fA-F]+);', 
                        lambda m: chr(int(m.group(1), 16)), cleaned)
        cleaned = re.sub(r'&#(\d+);', 
                        lambda m: chr(int(m.group(1))), cleaned)
        
        return cleaned
    
    @staticmethod
    def _format_response(text: str, language: str) -> str:
        """格式化响应文本"""
        # 移除多余空行
        lines = [line.strip() for line in text.split('\n') if line.strip()]
        formatted = '\n'.join(lines)
        
        # 确保合适的结尾
        if formatted and not formatted[-1] in '.。!！?？':
            formatted += '.' if language == 'en' else '。'
        
        return formatted

# ================== OpenAI服务 ==================
class OpenAIService:
    """OpenAI API服务封装"""
    
    def __init__(self):
        self.client = None
        self.initialize()
    
    def initialize(self):
        """初始化OpenAI客户端"""
        api_key = os.getenv('OPENAI_API_KEY')
        if api_key:
            try:
                self.client = OpenAI(api_key=api_key)
                logger.info("OpenAI客户端初始化成功")
            except Exception as e:
                logger.error(f"OpenAI客户端初始化失败: {e}")
                self.client = None
        else:
            logger.warning("未配置OPENAI_API_KEY")
    
    def is_available(self) -> bool:
        """检查服务是否可用"""
        return self.client is not None
    
    def generate_response(self, system_prompt: str, user_message: str, 
                         max_tokens: int = Config.DEFAULT_MAX_TOKENS) -> Optional[str]:
        """生成AI响应"""
        if not self.client:
            return None
        
        try:
            response = self.client.chat.completions.create(
                model=Config.OPENAI_MODEL,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_message}
                ],
                max_tokens=max_tokens,
                temperature=Config.DEFAULT_TEMPERATURE
            )
            return response.choices[0].message.content
        except Exception as e:
            logger.error(f"OpenAI API调用失败: {e}")
            return None

# ================== 初始化服务 ==================
content_manager = ContentManager()
language_detector = LanguageDetector()
response_cleaner = ResponseCleaner()
openai_service = OpenAIService()

# ================== API路由 ==================
@app.route('/api/chat', methods=['POST', 'OPTIONS'])
def chat():
    """处理聊天请求"""
    if request.method == 'OPTIONS':
        return jsonify({'status': 'ok'})
    
    try:
        data = request.get_json()
        message = data.get('message', '').strip()
        
        if not message:
            return jsonify({'error': '消息不能为空'}), 400
        
        # 检测语言
        language = language_detector.detect(message)
        logger.info(f"检测到语言: {language}")
        
        # 获取系统提示
        system_prompt = content_manager.get_system_prompt(language)
        
        # 尝试使用OpenAI
        response_text = None
        model_used = None
        
        if openai_service.is_available():
            response_text = openai_service.generate_response(system_prompt, message)
            if response_text:
                model_used = Config.OPENAI_MODEL
        
        # 使用本地回复作为备选
        if not response_text:
            response_text = content_manager.get_local_response(language)
            model_used = 'Local Response'
            logger.info("使用本地回复")
        
        # 清理响应
        cleaned_response = response_cleaner.clean(response_text, message, language)
        
        return jsonify({
            'response': cleaned_response,
            'model_used': model_used,
            'language': language,
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"处理聊天请求时出错: {e}")
        return jsonify({'error': '服务器内部错误'}), 500

@app.route('/api/health', methods=['GET', 'OPTIONS'])
def health_check():
    """健康检查"""
    if request.method == 'OPTIONS':
        return jsonify({'status': 'ok'})
    
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'openai_configured': openai_service.is_available()
    })

@app.route('/api/models', methods=['GET', 'OPTIONS'])
def get_models():
    """获取可用模型信息"""
    if request.method == 'OPTIONS':
        return jsonify({'status': 'ok'})
    
    return jsonify({
        'primary_model': Config.OPENAI_MODEL if openai_service.is_available() else 'Not Configured',
        'fallback_model': 'Local Response'
    })

@app.route('/')
def index():
    """主页路由"""
    return send_from_directory('.', 'index.html')

@app.route('/<path:filename>')
def serve_static(filename):
    """静态文件路由"""
    return send_from_directory('.', filename)

# ================== 错误处理 ==================
@app.errorhandler(404)
def not_found(error):
    """404错误处理"""
    return jsonify({'error': 'Not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    """500错误处理"""
    logger.error(f"Internal server error: {error}")
    return jsonify({'error': 'Internal server error'}), 500

# ================== 启动应用 ==================
if __name__ == '__main__':
    # 开发环境配置
    app.run(debug=True, host='0.0.0.0', port=5000)