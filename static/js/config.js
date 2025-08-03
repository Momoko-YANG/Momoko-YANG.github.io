// 环境配置
const config = {
    // 开发环境
    development: {
        apiUrl: 'http://127.0.0.1:5000/api/chat',
        baseUrl: 'http://127.0.0.1:5000',
        disableBackendAPI: false // 允许尝试连接后端
    },
    
    // 生产环境 - GitHub Pages
    production: {
        // 后端API地址 - 根据你的部署平台选择
        apiUrl: 'https://momoko-yang-backend.onrender.com/api/chat', // Render平台
        // apiUrl: 'https://your-app-name.railway.app/api/chat', // Railway平台
        // apiUrl: 'https://your-app-name.herokuapp.com/api/chat', // Heroku平台
        baseUrl: 'https://momoko-yang.github.io',
        disableBackendAPI: false // 允许尝试连接后端
    },
    
    // 本地文件模式 - 当直接打开index.html时使用
    localFile: {
        apiUrl: 'http://127.0.0.1:5000/api/chat', // 尝试连接本地后端
        baseUrl: 'file://',
        useLocalAI: true, // 启用本地智能回复作为备选
        disableBackendAPI: false // 允许尝试连接后端
    }
};

// 自动检测环境
const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const isLocalFile = window.location.protocol === 'file:';

let currentConfig;
if (isLocalFile) {
    currentConfig = config.localFile;
    console.log('📁 检测到本地文件模式，将使用本地智能回复系统');
} else if (isDevelopment) {
    currentConfig = config.development;
} else {
    currentConfig = config.production;
}

// 导出配置
window.appConfig = currentConfig;

// 调试信息
console.log('🔧 API配置信息:', {
    protocol: window.location.protocol,
    hostname: window.location.hostname,
    isDevelopment: isDevelopment,
    isLocalFile: isLocalFile,
    apiUrl: currentConfig.apiUrl,
    baseUrl: currentConfig.baseUrl,
    useLocalAI: currentConfig.useLocalAI
}); 