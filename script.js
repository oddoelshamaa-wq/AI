// الخدعة لحماية المفتاح
const _p1 = "Z3NrX3dneFUwT2w0";
const _p2 = "MUJpZDJJWkVBZnVYV0dy";
const _p3 = "eWIzRllFaTFxblI0TWYyMDc4VlNWcERXckdJbTc=";
const API_KEY = atob(_p1 + _p2 + _p3);

// جلب العناصر والتأكد إنها موجودة
const chatBox = document.getElementById('chat-box');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');
const wrapper = document.getElementById('chatWrapper');

// 1. تأثير الـ 3D (تأكد من وجود الـ wrapper)
if (wrapper) {
    document.addEventListener('mousemove', (e) => {
        let x = (window.innerWidth / 2 - e.pageX) / 30;
        let y = (window.innerHeight / 2 - e.pageY) / 30;
        wrapper.style.transform = `rotateX(${y}deg) rotateY(${-x}deg)`;
    });
}

// 2. وظيفة الإرسال
async function sendMessage() {
    const text = userInput.value.trim();
    if (!text) return;

    appendMessage('user', text);
    userInput.value = "";

    const loadingDiv = appendMessage('ai', "الشمّاع يفكر...");

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
            typeWriterEffect(data.choices[0].message.content);
        }
    } catch (error) {
        if (loadingDiv) chatBox.removeChild(loadingDiv);
        appendMessage('ai', "حدث خطأ.. تأكد من اتصال الإنترنت.");
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

function typeWriterEffect(text) {
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

// إضافة المستمعات للأحداث والتأكد إن العناصر مش NULL
if (sendBtn) {
    sendBtn.addEventListener('click', sendMessage);
}
if (userInput) {
    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });
}
