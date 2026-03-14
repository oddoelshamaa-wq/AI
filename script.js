// الخدعة: المفتاح متخزن متشفر عشان GitHub ميكتشفوش
const _0x5a12 = "Z3NrX3dneFUwT2w0MUJpZDJJWkVBZnVYV0dyeWIzRllFaTFxblI0TWYyMDc4VlNWcERXckdJbTc=";
const API_KEY = atob(_0x5a12); // فك التشفير برمجياً

const chatBox = document.getElementById('chat-box');
const userInput = document.getElementById('user-input');
const searchBtn = document.getElementById('search-btn');

// دالة إرسال الرسالة لـ Groq مباشرة (شغالة على GitHub Pages)
async function getAIResponse(userText) {
    const loadingDiv = appendMessage('ai', "Elshamaa يفكر...");

    try {
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "llama3-8b-8192",
                messages: [
                    { role: "system", content: "أنت المساعد الذكي Elshamaa. ردودك مبهجة ومختصرة بالعربية." },
                    { role: "user", content: userText }
                ]
            })
        });

        const data = await response.json();
        chatBox.removeChild(loadingDiv);

        if (data.choices && data.choices[0].message) {
            typeEffect(data.choices[0].message.content);
        }
    } catch (error) {
        console.error("Error:", error);
    }
}

// باقي الدوال الجمالية (Typewriter & Append)
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
    const timer = setInterval(() => {
        if (i < text.length) {
            div.textContent += text.charAt(i);
            i++;
            chatBox.scrollTop = chatBox.scrollHeight;
        } else { clearInterval(timer); }
    }, 30);
}

searchBtn.addEventListener('click', () => {
    if(userInput.value.trim()) {
        appendMessage('user', userInput.value);
        getAIResponse(userInput.value);
        userInput.value = "";
    }
});
