#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
云平台部署入口文件
用于Render、Railway、Heroku等云平台的部署
"""

import os
from website import app

if __name__ == '__main__':
    # 获取端口，云平台通常通过环境变量提供
    port = int(os.environ.get('PORT', 5000))
    
    # 启动应用
    app.run(
        host='0.0.0.0',  # 允许外部访问
        port=port,
        debug=False      # 生产环境关闭调试模式
    ) 