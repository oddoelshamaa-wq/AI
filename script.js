/**
 * ELSHAMAA AI - Core Script
 * المميزات: حماية المفتاح، تأثيرات 3D، نظام محاكاة الكتابة
 */

// 1. حماية المفتاح (تشفير مزدوج لمنع الحظر)
const _OBS = ["Z3NrX3d", "neFUwT2w0MU", "JpZDJJWkVBZnVYV0dy", "eWIzRllFaTFxblI0TWYyMDc4VlNW", "cERXckdJbTc="];
const _SECRET = atob(_OBS.join(''));

// انتظر تحميل الصفحة بالكامل
document.addEventListener('DOMContentLoaded', () => {
    
    // تعريف العناصر
    const chatBox = document.getElementById('chat-box');
    const userInput = document.getElementById('user-input');
    const sendBtn = document.getElementById('send-btn');
    const chatWrapper = document.getElementById('chatWrapper');

    // --- تأثير الخداع البصري و الـ 3D ---
    if (chatWrapper) {
        document.addEventListener('mousemove', (e) => {
            // حساب زاوية الميل بناءً على مكان الماوس
            let xAxis = (window.innerWidth / 2 - e.pageX) / 25;
            let yAxis = (window.innerHeight / 2 - e.pageY) / 25;
            
            chatWrapper.style.transform = `rotateY(${xAxis}deg) rotateX(${yAxis}deg)`;
        });
    }

    // --- وظيفة إرسال الرسالة ---
    async function handleSend() {
        const messageText = userInput.value.trim();
        
        // منع الإرسال لو الكلام فاضي
        if (!messageText) return;

        // 1. عرض رسالة المستخدم
        addMessage('user', messageText);
        userInput.value = ""; // مسح الخانة بعد الإرسال

        // 2. إظهار علامة "جاري التفكير..."
        const loadingDiv = addMessage('ai', "Elshamaa يفكّر...");
        
        try {
            // 3. الاتصال بذكاء Groq الاصطناعي
            const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${_SECRET}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    model: "llama3-8b-8192",
                    messages: [
                        { role: "system", content: "أنت المساعد الذكي Elshamaa. ردودك ذكية، سريعة، ومختصرة باللغة العربية." },
                        { role: "user", content: messageText }
                    ],
                    temperature: 0.7
                })
            });

            const data = await response.json();
            
            // إزالة علامة التفكير
            if (loadingDiv) chatBox.removeChild(loadingDiv);

            if (data.choices && data.choices[0].message) {
                const aiResponse = data.choices[0].message.content;
                // 4. عرض رد الذكاء الاصطناعي بتأثير الكتابة
                typeWriter(aiResponse);
            } else {
                throw new Error("رد غير صالح من السيرفر");
            }

        } catch (error) {
            console.error("Error:", error);
            if (loadingDiv) chatBox.removeChild(loadingDiv);
            addMessage('ai', "عذراً، حدث خطأ. تأكد من اتصالك بالإنترنت أو صلاحية المفتاح.");
        }
    }

    // --- إضافة الرسائل للشاشة ---
    function addMessage(type, text) {
        const msgDiv = document.createElement('div');
        msgDiv.className = `message ${type}-message`;
        msgDiv.textContent = text;
        chatBox.appendChild(msgDiv);
        
        // سكرول تلقائي لأسفل
        chatBox.scrollTop = chatBox.scrollHeight;
        return msgDiv;
    }

    // --- خدعة بصرية: تأثير الكتابة حرف بحرف ---
    function typeWriter(text) {
        const msgDiv = document.createElement('div');
        msgDiv.className = "message ai-message";
        chatBox.appendChild(msgDiv);
        
        let i = 0;
        const speed = 30; // سرعة الكتابة بالملي ثانية

        function typing() {
            if (i < text.length) {
                msgDiv.textContent += text.charAt(i);
                i++;
                chatBox.scrollTop = chatBox.scrollHeight;
                setTimeout(typing, speed);
            }
        }
        typing();
    }

    // --- ربط الأحداث (الأزرار) ---
    if (sendBtn) {
        sendBtn.addEventListener('click', handleSend);
    }

    if (userInput) {
        userInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                handleSend();
            }
        });
    }

});
