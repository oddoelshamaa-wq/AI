// حماية المفتاح
const p1 = "Z3NrX3dneFUwT2w0";
const p2 = "MUJpZDJJWkVBZnVYV0dy";
const p3 = "eWIzRllFaTFxblI0TWYyMDc4VlNWcERXckdJbTc=";
const API_KEY = atob(p1 + p2 + p3);

// جلب العناصر بعد تحميل الصفحة تماماً
document.addEventListener('DOMContentLoaded', () => {
    const chatBox = document.getElementById('chat-box');
    const userInput = document.getElementById('user-input');
    const sendBtn = document.getElementById('send-btn');
    const wrapper = document.getElementById('chatWrapper');

    // تأثير الـ 3D عند تحريك الماوس
    document.addEventListener('mousemove', (e) => {
        if (wrapper) {
            let x = (window.innerWidth / 2 - e.pageX) / 25;
            let y = (window.innerHeight / 2 - e.pageY) / 25;
            wrapper.style.transform = `rotateX(${y}deg) rotateY(${-x}deg)`;
        }
    });

    async function sendMessage() {
        const text = userInput.value.trim();
        if (!text) return;

        // إضافة رسالة المستخدم
        appendMessage('user', text);
        userInput.value = "";

        // رسالة انتظار
        const loadingDiv = appendMessage('ai', "جاري التفكير...");

        try {
            const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${API_KEY}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    model: "llama3-8b-8192",
                    messages: [{ role: "user", content: text }]
                })
            });

            const data = await response.json();
            chatBox.removeChild(loadingDiv);

            if (data.choices && data.choices[0].message) {
                typeEffect(data.choices[0].message.content);
            }
        } catch (error) {
            chatBox.removeChild(loadingDiv);
            appendMessage('ai', "عذراً، حدث خطأ في الاتصال.");
        }
    }

    function appendMessage(role, text) {
        const div = document.createElement('div');
        div.className = `message ${role}-message`;
        div.textContent = text;
        chatBox.appendChild(div);
        chatBox.scrollTop = chatBox.scrollHeight;
        return div;
    }

    function typeEffect(text) {
        const div = document.createElement('div');
        div.className = "message ai-message";
        chatBox.appendChild(div);
        let i = 0;
        const interval = setInterval(() => {
            if (i < text.length) {
                div.textContent += text.charAt(i);
                i++;
                chatBox.scrollTop = chatBox.scrollHeight;
            } else { clearInterval(interval); }
        }, 20);
    }

    // ربط الزرار والأحداث
    sendBtn.addEventListener('click', sendMessage);
    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });
});
