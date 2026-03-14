// 1. تعريف العناصر من الـ HTML
const chatBox = document.getElementById('chat-box');
const userInput = document.getElementById('user-input');
const searchBtn = document.getElementById('search-btn');

// 2. مفتاح Groq الخاص بك (شغال 100% في مصر)
const API_KEY = "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"; 

// وظيفة إرسال الرسالة
async function sendMessage() {
    const message = userInput.value.trim();
    
    // التأكد إن العميل كتب حاجة
    if (message === "") return;

    // إظهار رسالة العميل في الشات
    addMessage(message, 'user-message');
    userInput.value = ""; // مسح الخانة بعد الإرسال

    // إظهار علامة "جاري التفكير..."
    const loadingId = addMessage("ثواني وبفكر... ⚡", 'ai-message');

    try {
        // الاتصال بسيرفر Groq (سريع جداً ومتاح في مصر)
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": "Bearer " + API_KEY,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                // بنستخدم أحدث موديل متاح ومجاني من Llama
                model: "llama-3.3-70b-versatile", 
                messages: [
                    { role: "system", content: "أنت مساعد ذكي ومفيد وتتحدث اللغة العربية ببراعة." },
                    { role: "user", content: message }
                ],
                temperature: 0.7
            })
        });

        const data = await response.json();

        // فحص لو فيه رد سليم
        if (response.ok) {
            const aiResponse = data.choices[0].message.content;
            // استبدال جملة التحميل بالرد الحقيقي
            updateMessage(loadingId, aiResponse);
        } else {
            console.error("Groq Error:", data);
            updateMessage(loadingId, "عذراً، حدث خطأ: " + data.error.message);
        }

    } catch (error) {
        console.error("Connection Error:", error);
        updateMessage(loadingId, "فشل الاتصال بالسيرفر، تأكد من وجود إنترنت.");
    }
}

// --- وظائف مساعدة لإدارة الشات ---

// وظيفة لإضافة رسالة جديدة للشاشة
function addMessage(text, className) {
    const msgDiv = document.createElement('div');
    msgDiv.className = `message ${className}`;
    msgDiv.innerText = text;
    
    const messageId = "msg-" + Date.now();
    msgDiv.id = messageId;
    
    chatBox.appendChild(msgDiv);
    
    // التمرير لأسفل تلقائياً
    chatBox.scrollTop = chatBox.scrollHeight;
    
    return messageId;
}

// وظيفة لتحديث رسالة موجودة (عشان نشيل "جاري التفكير")
function updateMessage(id, newText) {
    const msgDiv = document.getElementById(id);
    if (msgDiv) {
        msgDiv.innerText = newText;
        chatBox.scrollTop = chatBox.scrollHeight;
    }
}

// --- ربط الأزرار ---

// الإرسال عند الضغط على الزرار
searchBtn.addEventListener('click', sendMessage);

// الإرسال عند الضغط على Enter من الكيبورد
userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendMessage();
    }
});
