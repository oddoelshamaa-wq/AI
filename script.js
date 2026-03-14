const chatBox = document.getElementById('chat-box');
const userInput = document.getElementById('user-input');
const searchBtn = document.getElementById('search-btn');
const container = document.getElementById('container3d');

// 1. تأثير الـ 3D عند تحريك الماوس
document.addEventListener('mousemove', (e) => {
    let xAxis = (window.innerWidth / 2 - e.pageX) / 25;
    let yAxis = (window.innerHeight / 2 - e.pageY) / 25;
    container.style.transform = `rotateY(${xAxis}deg) rotateX(${yAxis}deg)`;
});

// 2. وظيفة إرسال الرسالة
async function sendMessage() {
    const text = userInput.value.trim();
    if (!text) return;

    appendMessage('user', text);
    userInput.value = "";

    // إضافة مؤشر انتظار
    const loadingMsg = appendMessage('ai', "جاري التفكير...");

    try {
        // نرسل الطلب إلى الخادم الخاص بنا وليس Groq مباشرة
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: text })
        });

        const data = await response.json();
        chatBox.removeChild(loadingMsg); // حذف رسالة التحميل

        if (data.choices && data.choices[0].message) {
            typeWriter(data.choices[0].message.content);
        } else {
            appendMessage('ai', "حدث خطأ في استلام الرد.");
        }
    } catch (error) {
        chatBox.removeChild(loadingMsg);
        appendMessage('ai', "تأكد من إعدادات الـ Backend.");
    }
}

// 3. إضافة الرسائل للشاشة
function appendMessage(role, text) {
    const div = document.createElement('div');
    div.className = `message ${role}-message`;
    div.textContent = text;
    chatBox.appendChild(div);
    chatBox.scrollTop = chatBox.scrollHeight;
    return div;
}

// 4. خدعة بصرية: تأثير الكتابة الآلية
function typeWriter(text) {
    const div = document.createElement('div');
    div.className = "message ai-message";
    chatBox.appendChild(div);
    let i = 0;
    const interval = setInterval(() => {
        if (i < text.length) {
            div.textContent += text.charAt(i);
            i++;
            chatBox.scrollTop = chatBox.scrollHeight;
        } else {
            clearInterval(interval);
        }
    }, 20);
}

searchBtn.addEventListener('click', sendMessage);
userInput.addEventListener('keypress', (e) => { if(e.key === 'Enter') sendMessage(); });
