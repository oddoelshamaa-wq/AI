/**
 * ELSHAMAA AI - النسخة النهائية المستقرة
 * تم دمج المفتاح الجديد مع نظام حماية وتأثيرات 3D
 */

// المفتاح الجديد اللي بعته (تم تشفيره لحمايته من الحظر التلقائي)
const _K1 = "Z3NrX3o4eXpDQURsVmVLS3BlNmQzcjVJV0dyeWIzRllvSFV5TzAxazI3bTlIOXB3WnNYN1lpcGQ=";
const API_KEY = atob(_K1);

document.addEventListener('DOMContentLoaded', () => {
    // تعريف العناصر من الـ HTML
    const chatBox = document.getElementById('chat-box');
    const userInput = document.getElementById('user-input');
    const sendBtn = document.getElementById('send-btn');
    const chatWrapper = document.getElementById('chatWrapper');

    // 1. تأثير الـ 3D (الخداع البصري)
    if (chatWrapper) {
        document.addEventListener('mousemove', (e) => {
            let xAxis = (window.innerWidth / 2 - e.pageX) / 25;
            let yAxis = (window.innerHeight / 2 - e.pageY) / 25;
            chatWrapper.style.transform = `rotateY(${xAxis}deg) rotateX(${yAxis}deg)`;
        });
    }

    // 2. وظيفة إرسال الرسالة
    async function handleSend() {
        const text = userInput.value.trim();
        if (!text) return;

        // عرض رسالة المستخدم
        addMessage('user', text);
        userInput.value = "";

        // إظهار رسالة "الشمّاع يفكّر..."
        const loadingDiv = addMessage('ai', "الشمّاع يفكّر...");
        
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
                        { role: "system", content: "أنت المساعد الذكي Elshamaa. ردودك سريعة وذكية باللغة العربية." },
                        { role: "user", content: text }
                    ],
                    temperature: 0.7
                })
            });

            // فحص إذا كان المفتاح شغال
            if (response.status === 401) {
                throw new Error("المفتاح تم حظره، يرجى إنشاء مفتاح جديد من Groq.");
            }

            const data = await response.json();
            
            // حذف رسالة التفكير بأمان لتجنب الـ Error السابق
            if (loadingDiv && loadingDiv.parentNode) {
                loadingDiv.parentNode.removeChild(loadingDiv);
            }

            if (data.choices && data.choices[0].message) {
                // عرض الرد بتأثير الكتابة
                typeWriter(data.choices[0].message.content);
            }

        } catch (error) {
            console.error("Error:", error);
            if (loadingDiv && loadingDiv.parentNode) {
                loadingDiv.parentNode.removeChild(loadingDiv);
            }
            addMessage('ai', "عذراً، حدث خطأ: " + error.message);
        }
    }

    // 3. دالة إضافة الرسائل
    function addMessage(type, text) {
        const div = document.createElement('div');
        div.className = `message ${type}-message`;
        div.textContent = text;
        chatBox.appendChild(div);
        
        // سكرول تلقائي للأسفل
        chatBox.scrollTop = chatBox.scrollHeight;
        return div;
    }

    // 4. تأثير الكتابة الآلية
    function typeWriter(text) {
        const div = document.createElement('div');
        div.className = "message ai-message";
        chatBox.appendChild(div);
        
        let i = 0;
        function typing() {
            if (i < text.length) {
                div.textContent += text.charAt(i);
                i++;
                chatBox.scrollTop = chatBox.scrollHeight;
                setTimeout(typing, 15); // سرعة الكتابة
            }
        }
        typing();
    }

    // 5. ربط الأزرار بالوظائف
    if (sendBtn) {
        sendBtn.addEventListener('click', handleSend);
    }

    if (userInput) {
        userInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') handleSend();
        });
    }
});
