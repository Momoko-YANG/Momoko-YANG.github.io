from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import os
from datetime import datetime
import logging
from openai import OpenAI

app = Flask(__name__, static_folder='static')

# 配置CORS - 使用flask-cors库，移除自定义中间件
CORS(app, 
     origins=["https://momoko-yang.github.io"],  
     methods=["GET", "POST", "OPTIONS"],
     allow_headers=["Content-Type", "Authorization", "X-Requested-With", "Accept"],
     expose_headers=["Content-Type", "X-Total-Count"],
     supports_credentials=False,  # 设置为False以避免复杂配置
     max_age=86400  # 预检请求缓存时间
)

# 配置JSON编码，确保不会对特殊字符进行HTML实体编码
app.config['JSON_AS_ASCII'] = False
app.config['JSONIFY_PRETTYPRINT_REGULAR'] = False

# 配置日志
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# 移除重复的CORS中间件，只使用flask-cors
# @app.after_request
# def after_request(response):
#     """为所有响应添加CORS头"""
#     response.headers.add('Access-Control-Allow-Origin', '*')
#     response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
#     response.headers.add('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
#     return response

# 添加OPTIONS请求处理
@app.route('/api/chat', methods=['OPTIONS'])
def handle_options():
    """处理OPTIONS预检请求"""
    response = jsonify({'status': 'ok'})
    return response

# 配置API密钥
OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')

# 初始化OpenAI客户端
openai_client = None
try:
    openai_client = OpenAI(api_key=OPENAI_API_KEY)
    logger.info("OpenAI客户端初始化成功")
except Exception as e:
    logger.error(f"OpenAI客户端初始化失败: {e}")
    openai_client = None

def detect_language(text):
    """增强的语言检测，与chatbot.js保持一致"""
    # 统计各语言字符数量
    chinese_chars = 0
    japanese_chars = 0
    english_chars = 0
    total_chars = 0
    
    for char in text:
        code = ord(char)
        
        # 中文字符（CJK统一汉字）
        if ((code >= 0x4E00 and code <= 0x9FFF) or
            (code >= 0x3400 and code <= 0x4DBF)):
            chinese_chars += 1
        # 平假名
        elif code >= 0x3040 and code <= 0x309F:
            japanese_chars += 1
        # 片假名
        elif code >= 0x30A0 and code <= 0x30FF:
            japanese_chars += 1
        # 英文字母
        elif ((code >= 65 and code <= 90) or (code >= 97 and code <= 122)):
            english_chars += 1
        
        # 计算有效字符总数
        if code > 32 and code < 127 or code > 0x3000:
            total_chars += 1
    
    # 如果没有有效字符，默认中文
    if total_chars == 0:
        return 'zh'
    
    # 计算各语言比例
    chinese_ratio = chinese_chars / total_chars
    japanese_ratio = japanese_chars / total_chars
    english_ratio = english_chars / total_chars
    
    # 日语检测优先
    if japanese_ratio > 0.1:
        return 'ja'
    
    # 英语检测（纯英文）
    if english_ratio > 0.8 and chinese_chars == 0 and japanese_chars == 0:
        return 'en'
    
    # 默认中文
    return 'zh'

def get_system_prompt(language):
    """根据语言获取系统提示"""
    prompts = {
        'zh': """
你是 Momoko 的 AI 助手，用于提供专业且个性化的解答与建议。

Momoko 简介：
- 2000年出生，老家在中国吉林省吉林市
- 🎓 教育背景：吉林大学经济学本科；早稻田大学经济学硕士（Statistical Finance）
- 💻 专业技能：
  • 编程语言：Python（数据分析/机器学习）、R（统计/时间序列）、Java
  • 工具：SQL、Excel、Stata、前端基础
  • 机器学习与深度学习：算法实现、数据挖掘、大模型知识
- 🌍 语言能力：中文（母语）、英文（流利）、日文（熟练）、法语（学习中）
- 🏃‍♀️ 兴趣爱好：长跑（2023年富士山马拉松完赛）、计划学习网球与贝斯、东亚文学（张爱玲、白先勇、三岛由纪夫）、东南亚料理
- 🎯 目标：
  • 短期：提升编程能力与数学基础
  • 中期：掌握前沿深度学习（如 Transformers、GNN）
  • 长期：将 Statistical Finance 与大模型结合，用于金融风险管理与量化策略

【交互指令】：
- 当问题模糊时，先澄清需求后再回答
- 当提问与目标不一致时，可委婉提醒并提出更优建议

【回答要求】：
1. 简洁：用最少文字传达核心信息（200–400字）
2. 完整：涵盖问题全部要点
3. 突出重点：优先体现 Momoko 机器学习的技能，并强调她的学习能力，以及对行业的热情
4. 避免冗余：不重复相同信息
5. 结构清晰：列表、要点或段落形式
6. 灵活调整：问题简单时简短回答；复杂问题适当详细
7. 风格：专业且友好，避免空洞套话
""",

        'en': """
You are Momoko’s AI assistant, designed to provide professional and personalized answers and suggestions.

About Momoko:
- Born in 2000, originally from Jilin City, Jilin Province, China
- 🎓 Education: Bachelor’s in Economics (Jilin University); Master’s in Economics (Waseda University), specializing in Statistical Finance
- 💻 Professional skills:
  • Programming languages: Python (data analysis / machine learning), R (statistics / time series), Java
  • Tools: SQL, Excel, Stata, basic front-end development
  • Machine learning & deep learning: algorithm implementation, data mining, large language models
- 🌍 Languages: Native Chinese, fluent English, proficient Japanese, learning French
- 🏃‍♀️ Interests: Long-distance running (completed Mt. Fuji Marathon 2023), plans to learn tennis & bass guitar, East Asian literature (Eileen Chang, Pai Hsien-Yung, Yukio Mishima), Southeast Asian cuisine
- 🎯 Goals:
  • Short-term: Enhance programming skills and math foundation
  • Mid-term: Master cutting-edge deep learning (e.g., Transformers, GNN)
  • Long-term: Combine Statistical Finance and large models for financial risk management and quantitative strategies

Interaction instructions:
- When a question is unclear, first clarify before answering
- When a question deviates from Momoko’s goals, gently remind and suggest a better direction

Answer requirements:
1. Be concise: deliver the core message in as few words as possible (200–400 words)
2. Be complete: cover all aspects of the question
3. Highlight: Momoko’s machine learning skills, learning ability, and passion for the field
4. Avoid redundancy: do not repeat the same information
5. Clear structure: use bullet points, lists, or paragraphs
6. Adjust depth: keep answers short for simple questions; be appropriately detailed for complex ones
7. Style: professional yet friendly, avoid empty formalities
""",

        'jp': """
あなたは Momoko の AI アシスタントです。専門的かつパーソナライズされた回答と提案を提供します。

Momoko について：
- 2000年生まれ、中国吉林省吉林市出身
- 🎓 学歴：吉林大学経済学部卒業；早稲田大学大学院経済学研究科修士（統計ファイナンス専攻）
- 💻 専門スキル：
  • プログラミング言語：Python（データ分析・機械学習）、R（統計・時系列分析）、Java
  • ツール：SQL、Excel、Stata、フロントエンド基礎
  • 機械学習・深層学習：アルゴリズム実装、データマイニング、大規模言語モデル
- 🌍 語学力：中国語（母語）、英語（流暢）、日本語（上級）、フランス語（学習中）
- 🏃‍♀️ 趣味・関心：長距離ランニング（2023年富士山マラソン完走）、テニスとベースの習得を計画、東アジア文学（張愛玲・白先勇・三島由紀夫）、東南アジア料理
- 🎯 目標：
  • 短期：プログラミング力と数学基礎の向上
  • 中期：最先端の深層学習技術（Transformers や GNN など）の習得
  • 長期：統計ファイナンスと大規模モデルを組み合わせ、金融リスク管理やクオンツ戦略に活用

【対話方針】：
- 質問が曖昧な場合、まず内容を確認してから回答
- Momoko の目標から外れた質問には、やんわり指摘し適切な方向を提案

【回答ルール】：
1. 簡潔に：最小限の言葉で核心を伝える（200–400字）
2. 網羅的に：質問の全体をカバーする
3. 強調点：Momoko の機械学習スキル、学習力、業界への熱意を優先的に示す
4. 冗長を避ける：同じ情報を繰り返さない
5. 構成を明確に：箇条書きや段落などで読みやすく
6. 柔軟に調整：簡単な質問には短く、複雑な質問には詳しく
7. スタイル：専門的かつフレンドリー、空虚な定型句は避ける
"""
    }
    return prompts.get(language, prompts['en'])

def clean_response(response_text, original_message, language):
    """清理AI响应"""
    cleaned = response_text.strip()
    
    # 移除可能的输入重复
    if cleaned.lower().startswith(original_message.lower()):
        cleaned = cleaned[len(original_message):].strip()
    
    # 移除系统提示（包括新的详细格式）
    system_prompts = [
        "你是Momoko的AI助手",
        "You are Momoko's AI assistant",
        "あなたはMomokoのAIアシスタントです",
        "🎓 教育背景：",
        "🎓 Educational Background:",
        "🎓 教育背景：",
        "💻 专业技能：",
        "💻 Professional Skills:",
        "💻 専門スキル：",
        "🌍 语言能力：",
        "🌍 Language Skills:",
        "🌍 言語能力：",
        "🏃‍♀️ 兴趣爱好：",
        "🏃‍♀️ Hobbies & Interests:",
        "🏃‍♀️ 趣味と興味：",
        "📚 学习历程：",
        "📚 Learning Journey:",
        "📚 学習履歴："
    ]
    
    for prompt in system_prompts:
        if prompt in cleaned:
            cleaned = cleaned.replace(prompt, '').strip()
    
    # 移除User:和Assistant:标记
    cleaned = cleaned.replace('User:', '').replace('Assistant:', '').strip()
    
    # 清理HTML实体 - 更全面的清理
    html_entities = {
        '&amp;': '&',
        '&lt;': '<',
        '&gt;': '>',
        '&quot;': '"',
        '&#39;': "'",
        '&apos;': "'",
        '&nbsp;': ' ',
        '&#x27;': "'",
        '&#x2F;': '/',
        '&#x60;': '`',
        '&#x3D;': '=',
        '&#x2B;': '+',
        '&#x22;': '"',
        '&#x3C;': '<',
        '&#x3E;': '>',
        '&#x26;': '&'
    }
    
    # 多次清理HTML实体，确保所有实体都被处理
    import re
    attempts = 0
    max_attempts = 5
    previous_cleaned = ''
    
    while cleaned != previous_cleaned and attempts < max_attempts:
        previous_cleaned = cleaned
        
        # 处理命名的HTML实体
        for entity, char in html_entities.items():
            cleaned = cleaned.replace(entity, char)
        
        # 处理数字HTML实体 (如 &#38;)
        cleaned = re.sub(r'&#(\d+);', lambda m: chr(int(m.group(1))), cleaned)
        
        # 处理十六进制HTML实体 (如 &#x26;)
        cleaned = re.sub(r'&#x([0-9a-fA-F]+);', lambda m: chr(int(m.group(1), 16)), cleaned)
        
        attempts += 1
    
    # 最终检查：确保没有残留的HTML实体
    if '&amp;' in cleaned or '&lt;' in cleaned or '&gt;' in cleaned:
        cleaned = cleaned.replace('&amp;', '&').replace('&lt;', '<').replace('&gt;', '>')
    
    # 最终清理：确保所有&符号都是正确的
    # 先解码所有HTML实体
    cleaned = cleaned.replace('&amp;', '&').replace('&lt;', '<').replace('&gt;', '>')
    # 然后确保独立的&符号不被编码
    # 这里我们不做任何编码，让前端处理显示
    
    # 移除多余的换行和空格
    cleaned = '\n'.join(line.strip() for line in cleaned.split('\n') if line.strip())
    
    # 确保有合适的结尾
    if cleaned and not cleaned.endswith(('.', '。', '!', '！', '?', '？')):
        cleaned += '.' if language == 'en' else '。'
    
    return cleaned

def get_optimal_tokens(user_message):
    """设置固定的token数量以提高回复速度"""
    # 固定设置合适的token数，与前端保持一致
    fixed_tokens = 600  # 设置一个平衡的固定值
    
    logger.info(f"使用固定token设置: {fixed_tokens}")
    return fixed_tokens

def call_openai_api(system_prompt, user_message, max_tokens=None):
    """调用OpenAI API"""
    if not openai_client:
        raise Exception("OpenAI客户端未初始化")
    
    # 如果没有指定max_tokens，则动态计算
    if max_tokens is None:
        max_tokens = get_optimal_tokens(user_message)
    
    try:
        response = openai_client.chat.completions.create(
            model="gpt-4o-mini",  # 或者等 GPT-4-nano 公布后替换
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_message}
            ],
            max_tokens=max_tokens,
            temperature=0.7
        )
        
        return response.choices[0].message.content
        
    except Exception as e:
        logger.error(f"OpenAI API调用失败: {e}")
        raise

@app.route('/api/chat', methods=['POST'])
def chat():
    """处理聊天请求"""
    try:
        data = request.get_json()
        message = data.get('message', '').strip()
        
        if not message:
            return jsonify({'error': '消息不能为空'}), 400
        
        # 检测语言
        language = detect_language(message)
        logger.info(f"检测到语言: {language}")
        
        # 获取系统提示
        system_prompt = get_system_prompt(language)
        
        # 尝试使用OpenAI API
        response_text = None
        model_used = None
        
        if openai_client:
            try:
                logger.info("尝试使用OpenAI GPT-4o-mini模型")
                response_text = call_openai_api(system_prompt, message)
                model_used = 'GPT-4o-mini'
            except Exception as e:
                logger.warning(f"OpenAI API失败: {e}")
        
        # 如果OpenAI失败，使用本地回复
        if not response_text:
            logger.info("使用本地回复作为备选方案")
            local_responses = {
                'zh': """🤖 你好！我是Momoko的AI助手，很高兴为您服务！

🎓 **Momoko的详细教育背景：**
- **本科阶段**：吉林大学经济学院经济学系，这是中国著名的985高校，在经济学领域享有很高声誉
- **硕士阶段**：早稻田大学经济学研究科，这是日本顶尖的私立大学，在亚洲乃至世界都有重要影响力
- **专业方向**：经济学，特别是Statistical Finance（统计金融）这个前沿交叉学科
- **学术成就**：在本科期间参加美国大学生数学建模竞赛(ICM)并获得M奖，这是国际认可的重要学术荣誉

💻 **专业技能详解：**
- **编程语言**：Python（数据分析和机器学习）、R语言（统计计算和时间序列分析）、Java（面向对象编程）
- **数据分析**：统计学理论与应用、金融数据分析、时间序列分析、经济模型构建、计量经济学方法
- **机器学习**：机器学习算法与应用、深度学习理论与实践、数据挖掘与特征工程、大模型相关知识
- **工具掌握**：SQL、Excel、Stata、前端开发（HTML/CSS/JavaScript基础）

🌍 **多语言能力：**
- 中文：母语水平，能够进行专业学术交流
- 英文：流利，具备国际学术交流能力
- 日文：熟练，在日本学习生活无障碍
- 法语：正在学习中，已掌握基础日常用语

🏃‍♀️ **丰富的兴趣爱好：**
- **运动健身**：热爱长跑，2023年完成富士山马拉松（全马42.195公里），展现了极强的毅力和体能
- **音乐品味**：喜欢摇滚音乐，特别钟爱Guns N' Roses和Megadeth等经典乐队
- **文学阅读**：喜欢东亚文学，最爱张爱玲和白先勇的作品
- **烹饪技能**：会做泰国料理，对东南亚美食有浓厚兴趣
- **个人偏好**：不喜欢寒冷的冬天，更喜欢温暖宜人的气候

📚 **学习历程与目标：**
- 2023年：开始系统学习Python编程，为数据科学打下基础
- 2024年：全面掌握R、Python、Java等编程语言
- 持续学习：专注于机器学习与深度学习的前沿技术
- 职业目标：成为优秀的机器学习工程师，将统计金融与AI技术完美结合

💡 **专业特色：**
Momoko在Statistical Finance与机器学习结合应用方面有独特优势，能够将传统金融理论与现代AI技术相结合，在量化投资、风险管理、金融预测等领域有广阔的应用前景。

您可以询问我关于Momoko的任何方面，包括专业技能、项目经验、教育背景、兴趣爱好或联系方式！我会为您提供详细而专业的回答。""",
                
                'en': """🤖 Hello! I'm Momoko's AI Assistant, and I'm delighted to serve you!

🎓 **Momoko's Detailed Educational Background:**
- **Undergraduate**: School of Economics, Jilin University, a prestigious 985 university in China with excellent reputation in economics
- **Graduate**: Graduate School of Economics, Waseda University, one of Japan's top private universities with significant influence in Asia and worldwide
- **Field of Study**: Economics, specifically Statistical Finance, a cutting-edge interdisciplinary field
- **Academic Achievement**: Won the M Award in the Interdisciplinary Contest in Modeling (ICM) during undergraduate studies, an internationally recognized academic honor

💻 **Comprehensive Professional Skills:**
- **Programming Languages**: Python (data analysis and machine learning), R Language (statistical computing and time series analysis), Java (object-oriented programming)
- **Data Analysis**: Statistical theory & application, financial data analysis, time series analysis, economic model building, econometric methods
- **Machine Learning**: Machine learning algorithms & applications, deep learning theory & practice, data mining & feature engineering, large language models knowledge
- **Tools & Technologies**: SQL, Excel, Stata, Frontend Development (HTML/CSS/JavaScript basics)

🌍 **Multilingual Capabilities:**
- Chinese: Native level, capable of professional academic communication
- English: Fluent, with international academic exchange capabilities
- Japanese: Proficient, able to study and live in Japan without barriers
- French: Currently learning, with basic conversational skills

🏃‍♀️ **Rich Hobbies & Interests:**
- **Sports & Fitness**: Loves long-distance running, completed the 2023 Fuji Mountain Marathon (full marathon 42.195km), demonstrating exceptional perseverance and physical fitness
- **Music Taste**: Enjoys rock music, particularly fond of classic bands like Guns N' Roses and Megadeth
- **Literature**: Likes East Asian literature, favorite authors include Eileen Chang and Pai Hsien-yung
- **Culinary Skills**: Can cook Thai food, has a strong interest in Southeast Asian cuisine
- **Personal Preferences**: Dislikes cold winters, prefers warm and pleasant climates

📚 **Learning Journey & Goals:**
- 2023: Started systematic Python programming learning, laying foundation for data science
- 2024: Mastered R, Python, Java and other programming languages
- Continuous Learning: Focused on cutting-edge machine learning and deep learning technologies
- Career Goal: Become an excellent machine learning engineer, perfectly combining statistical finance with AI technology

💡 **Professional Specialties:**
Momoko has unique advantages in combining Statistical Finance with machine learning applications, able to integrate traditional financial theory with modern AI technology, with broad application prospects in quantitative investment, risk management, financial forecasting, and other fields.

You can ask me about any aspect of Momoko, including professional skills, project experience, education background, hobbies, or contact information! I'll provide you with detailed and professional answers.""",
                
                'ja': """🤖 こんにちは！私はMomokoのAIアシスタントです。お手伝いできることを嬉しく思います！

🎓 **Momokoの詳細な教育背景：**
- **学士課程**：吉林大学経済学院経済学科、中国の著名な985大学で、経済学分野で高い評価を得ています
- **修士課程**：早稲田大学大学院経済学研究科、日本を代表する私立大学で、アジアおよび世界で重要な影響力を持っています
- **専門分野**：経済学、特にStatistical Finance（統計金融）という最先端の学際分野
- **学術成果**：学部時代にインターコンチネンタルコンテストインモデリング（ICM）でM賞を獲得、国際的に認められた重要な学術栄誉

💻 **包括的な専門スキル：**
- **プログラミング言語**：Python（データ分析と機械学習）、R言語（統計計算と時系列分析）、Java（オブジェクト指向プログラミング）
- **データ分析**：統計学理論と応用、金融データ分析、時系列分析、経済モデル構築、計量経済学手法
- **機械学習**：機械学習アルゴリズムと応用、ディープラーニング理論と実践、データマイニングと特徴量エンジニアリング、大規模言語モデル関連知識
- **ツール・技術**：SQL、Excel、Stata、フロントエンド開発（HTML/CSS/JavaScript基礎）

🌍 **多言語能力：**
- 中国語：母語レベル、専門的な学術交流が可能
- 英語：流暢、国際的な学術交流能力を有する
- 日本語：熟練、日本での学習・生活に支障なし
- フランス語：現在学習中、基本的な日常会話が可能

🏃‍♀️ **豊富な趣味と興味：**
- **スポーツ・フィットネス**：長距離ランニングが好き、2023年富士山マラソン完走（フルマラソン42.195km）、卓越した忍耐力と体力を証明
- **音楽の好み**：ロック音楽を楽しむ、特にGuns N' RosesやMegadethなどのクラシックバンドがお気に入り
- **文学**：東アジア文学が好き、お気に入りの作家に張愛玲や白先勇がいる
- **料理スキル**：タイ料理が作れる、東南アジア料理に強い関心
- **個人的な好み**：寒い冬が嫌い、暖かく快適な気候を好む

📚 **学習履歴と目標：**
- 2023年：データサイエンスの基礎を築くため、Pythonプログラミングの体系的な学習を開始
- 2024年：R、Python、Javaなどのプログラミング言語を習得
- 継続学習：最先端の機械学習とディープラーニング技術に焦点
- キャリア目標：統計金融とAI技術を完璧に組み合わせた優秀な機械学習エンジニアになる

💡 **専門的特徴：**
MomokoはStatistical Financeと機械学習の結合応用において独特な利点を持ち、伝統的な金融理論と現代のAI技術を統合し、定量投資、リスク管理、金融予測などの分野で広範な応用可能性があります。

Momokoの専門スキル、プロジェクト経験、教育背景、趣味、連絡先など、どのようなことでもお聞きください！詳細で専門的な回答を提供いたします。"""
            }
            response_text = local_responses.get(language, local_responses['en'])
            model_used = 'Local Response'
        
        # 清理响应
        cleaned_response = clean_response(response_text, message, language)
        
        # 返回结果
        result = {
            'response': cleaned_response,
            'model_used': model_used,
            'language': language,
            'timestamp': datetime.now().isoformat()
        }
        
        logger.info(f"成功生成回复，使用模型: {model_used}")
        return jsonify(result)
        
    except Exception as e:
        logger.error(f"处理聊天请求时出错: {e}")
        return jsonify({'error': '服务器内部错误'}), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    """健康检查端点"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'openai_configured': openai_client is not None
    })

@app.route('/api/health', methods=['OPTIONS'])
def handle_health_options():
    """处理健康检查OPTIONS预检请求"""
    response = jsonify({'status': 'ok'})
    return response

@app.route('/api/models', methods=['GET'])
def get_models():
    """获取可用模型信息"""
    return jsonify({
        'primary_model': 'GPT-4o-mini' if openai_client else 'Not Configured',
        'fallback_model': 'Local Response'
    })

@app.route('/api/models', methods=['OPTIONS'])
def handle_models_options():
    """处理模型信息OPTIONS预检请求"""
    response = jsonify({'status': 'ok'})
    return response

@app.route('/')
def index():
    """主页路由"""
    return send_from_directory('.', 'index.html')

@app.route('/<path:filename>')
def serve_static(filename):
    """静态文件路由"""
    return send_from_directory('.', filename)

if __name__ == '__main__':
    # 开发环境配置
    app.run(debug=True, host='0.0.0.0', port=5000) 
