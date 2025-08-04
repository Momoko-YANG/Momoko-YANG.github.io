// 版权信息 - 生产环境已移除调试输出

document.addEventListener('contextmenu', function (event) {
    event.preventDefault();
});

function handlePress(event) {
    this.classList.add('pressed');
}

function handleRelease(event) {
    this.classList.remove('pressed');
}

function handleCancel(event) {
    this.classList.remove('pressed');
}

var buttons = document.querySelectorAll('.projectItem');
buttons.forEach(function (button) {
    button.addEventListener('mousedown', handlePress);
    button.addEventListener('mouseup', handleRelease);
    button.addEventListener('mouseleave', handleCancel);
    button.addEventListener('touchstart', handlePress);
    button.addEventListener('touchend', handleRelease);
    button.addEventListener('touchcancel', handleCancel);
});

function toggleClass(selector, className) {
    var elements = document.querySelectorAll(selector);
    elements.forEach(function (element) {
        element.classList.toggle(className);
    });
}

function pop(imageURL) {
    var tcMainElement = document.querySelector(".tc-img");
    if (imageURL) {
        tcMainElement.src = imageURL;
    }
    toggleClass(".tc-main", "active");
    toggleClass(".tc", "active");
}

var tc = document.getElementsByClassName('tc');
var tc_main = document.getElementsByClassName('tc-main');
tc[0].addEventListener('click', function (event) {
    pop();
});
tc_main[0].addEventListener('click', function (event) {
    event.stopPropagation();
});



function setCookie(name, value, days) {
    var expires = "";
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + value + expires + "; path=/";
}

function getCookie(name) {
    var nameEQ = name + "=";
    var cookies = document.cookie.split(';');
    for (var i = 0; i < cookies.length; i++) {
        var cookie = cookies[i];
        while (cookie.charAt(0) == ' ') {
            cookie = cookie.substring(1, cookie.length);
        }
        if (cookie.indexOf(nameEQ) == 0) {
            return cookie.substring(nameEQ.length, cookie.length);
        }
    }
    return null;
}




document.addEventListener('DOMContentLoaded', function () {






    var html = document.querySelector('html');
    var themeState = getCookie("themeState") || "Light";
    var tanChiShe = document.getElementById("tanChiShe");






    function changeTheme(theme) {
        tanChiShe.src = "./static/svg/snake-" + theme + ".svg";
        html.dataset.theme = theme;
        setCookie("themeState", theme, 365);
        themeState = theme;
    }







    var Checkbox = document.getElementById('myonoffswitch')
    Checkbox.addEventListener('change', function () {
        if (themeState == "Dark") {
            changeTheme("Light");
        } else if (themeState == "Light") {
            changeTheme("Dark");
        } else {
            changeTheme("Dark");
        }
    });



    if (themeState == "Dark") {
        Checkbox.checked = false;
    }

    changeTheme(themeState);



    var fpsElement = document.createElement('div');
    fpsElement.id = 'fps';
    fpsElement.style.zIndex = '10000';
    fpsElement.style.position = 'fixed';
    fpsElement.style.left = '0';
    document.body.insertBefore(fpsElement, document.body.firstChild);

    var showFPS = (function () {
        var requestAnimationFrame = window.requestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            window.oRequestAnimationFrame ||
            window.msRequestAnimationFrame ||
            function (callback) {
                window.setTimeout(callback, 1000 / 60);
            };

        var fps = 0,
            last = Date.now(),
            offset, step, appendFps;

        step = function () {
            offset = Date.now() - last;
            fps += 1;

            if (offset >= 1000) {
                last += offset;
                appendFps(fps);
                fps = 0;
            }

            requestAnimationFrame(step);
        };

        appendFps = function (fpsValue) {
            fpsElement.textContent = 'FPS: ' + fpsValue;
        };

        step();
    })();



    //pop('./static/img/tz.jpg')



});




var pageLoading = document.querySelector("#momoko-loading");
window.addEventListener('load', function () {
    setTimeout(function () {
        pageLoading.style.opacity = '0';
    }, 100);
});



// 设置密码
const CORRECT_PASSWORD = "myresume2025";

// 简历文件路径
const RESUMES = {
    resume1: {
        path: "./static/files/Reference.pdf",
        filename: "Reference.pdf",
        displayName: "CV (English)"
    },
    resume2: {
        path: "./static/files/Title_Page_A_En.pdf",
        filename: "Title_Page_A_En.pdf",
        displayName: "CV (Japanese)"
    },
    resume3: {
        path: "./static/files/技术发表.pdf",
        filename: "技术发表.pdf",
        displayName: "CV (Chinese)"
    }
};

let currentResumeType = null;

function showPasswordModal(resumeType) {

    currentResumeType = resumeType;

    const modal = document.getElementById('passwordModal');
    const modalTitle = document.getElementById('modalTitle') || createModalTitle();

    modalTitle.textContent = `Download ${RESUMES[resumeType].displayName}`;

    modal.style.display = 'block';
    // 添加动画类
    setTimeout(() => {
        modal.classList.add('show');
    }, 10);
    document.getElementById('passwordInput').focus();

    // 防止背景滚动
    document.body.style.overflow = 'hidden';
}

function createModalTitle() {
    // 如果模态框标题不存在，创建一个
    const modal = document.getElementById('passwordModal');
    const title = document.createElement('h3');
    title.id = 'modalTitle';
    title.style.marginBottom = '20px';
    title.style.color = '#2d3748';
    title.style.fontSize = '18px';
    title.style.fontWeight = '600';
    modal.querySelector('.modal-content').insertBefore(title, modal.querySelector('.modal-content').firstChild);
    return title;
}

function closeModal() {
    const modal = document.getElementById('passwordModal');
    modal.classList.remove('show');

    // 延迟隐藏模态框，等待动画完成
    setTimeout(() => {
        modal.style.display = 'none';
        document.getElementById('passwordInput').value = '';
        document.getElementById('errorMessage').style.display = 'none';

        currentResumeType = null;
        // 恢复背景滚动
        document.body.style.overflow = 'auto';

        const input = document.getElementById('passwordInput');
        input.style.borderColor = '';
        input.style.boxShadow = '';
    }, 300);
}

function checkPassword() {
    const inputPassword = document.getElementById('passwordInput').value;
    const errorMessage = document.getElementById('errorMessage');

    if (!currentResumeType) {
        console.error('No resume type selected');
        errorMessage.textContent = 'Select a resume to download';
        errorMessage.style.display = 'block';
        return;
    }

    if (inputPassword === CORRECT_PASSWORD) {
        // 密码正确，显示成功状态
        const input = document.getElementById('passwordInput');
        input.style.borderColor = '#4ade80';
        input.style.boxShadow = '0 0 0 3px rgba(74, 222, 128, 0.1)';

        // 延迟一下再开始下载和关闭模态框
        setTimeout(() => {
            downloadResume(currentResumeType);
            closeModal();
        }, 500);

        errorMessage.style.display = 'none';
    } else {
        // 密码错误，显示错误状态
        const input = document.getElementById('passwordInput');
        input.style.borderColor = '#ff6b6b';
        input.style.boxShadow = '0 0 0 3px rgba(255, 107, 107, 0.1)';

        // 添加摇晃动画
        input.style.animation = 'shake 0.5s ease-in-out';
        setTimeout(() => {
            input.style.animation = '';
        }, 500);

        errorMessage.textContent = 'Incorrect password, please try again.';
        errorMessage.style.display = 'block';
        document.getElementById('passwordInput').value = '';
        document.getElementById('passwordInput').focus();
    }
}

function downloadResume(resumeType) {
    if (!resumeType || !RESUMES[resumeType]) {
        console.error('Invalid resume type:', resumeType);
        return;
    }

    const resume = RESUMES[resumeType];
    
    // 创建一个隐藏的链接来触发下载
    const link = document.createElement('a');
    link.href = resume.path;
    link.download = resume.filename;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // 显示下载成功提示
    showDownloadNotification(resume.displayName);
            // 下载简历: resume.displayName
}

function showDownloadNotification(resumeName) {
    // 创建下载成功提示
    const notification = document.createElement('div');
    notification.textContent = `${resumeName} Start downloading`;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #4ade80;
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        font-size: 14px;
        transition: all 0.3s ease;
    `;

    document.body.appendChild(notification);

    // 3秒后自动移除提示
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 300);
    }, 3000);
}


// 支持回车键确认
document.getElementById('passwordInput').addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        checkPassword();
    }
});

// 点击模态框外部关闭
window.addEventListener('click', function (e) {
    const modal = document.getElementById('passwordModal');
    if (e.target === modal) {
        closeModal();
    }
});

// 支持ESC键关闭
document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
        const modal = document.getElementById('passwordModal');
        if (modal.style.display === 'block') {
            closeModal();
        }
    }
});

function downloadResume1() {
    showPasswordModal('resume1');
}

function downloadResume2() {
    showPasswordModal('resume2');
}

function downloadResume3() {
    showPasswordModal('resume3');
}

// ============================================================================
// 网站基本功能加载完成
// 聊天机器人模块将通过HTML直接加载
// ============================================================================

