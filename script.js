// 1. إعداد العناصر الأساسية
const chatBox = document.getElementById('chat-box');
const userInput = document.getElementById('user-input');
const searchBtn = document.getElementById('search-btn');

// مفتاح API (تأكد أن هذا المفتاح فعال)
const API_KEY = "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"; 

// 2. ذاكرة المحادثة وتعليمات النظام (هنا تضع رقمك وبياناتك)
let messagesHistory = [
    { 
        role: "system", 
        content: `أنت المساعد الذكي الرسمي لشركة "الشماع للبرمجيات والنظم" (ELSHAMAA Tech).
        
        بيانات التواصل الرسمية للشركة:
        - رقم الموبايل والواتساب: 01122884885 (قم بتغيير هذا الرقم لرقمك الحقيقي)
        - البريد الإلكتروني: info@elshamaa.tech
        - الموقع: مصر، القاهرة.

        هويتك: خبير تقني محترف. 
        خدماتنا: برمجة المواقع، المتاجر الإلكترونية، أنظمة الإدارة ERP، وتطبيقات الأندرويد والآيفون.
        
        تعليمات هامة:
        - إذا سألك العميل "ازاي اتواصل معاكم" أو طلب "رقم الموبايل"، أعطه الرقم المذكور أعلاه فوراً.
        - استخدم لغة عربية مهذبة واحترافية مع إيموجي مناسبة.` 
    }
];

// 3. وظيفة الأزرار السريعة (Quick Buttons)
function sendQuickMsg(text) {
    userInput.value = text;
    sendMessage();
}

// 4. الوظيفة الأساسية لإرسال واستقبال الرسائل
async function sendMessage() {
    const text = userInput.value.trim();
    if (text === "") return;

    // إضافة رسالة المستخدم للواجهة
    addMessage(text, 'user-message');
    messagesHistory.push({ role: "user", content: text });
    
    // مسح خانة الإدخال
    userInput.value = "";
    
    // إنشاء "لوجو التحميل" الخاص بالشماع
    const loadingId = "load-" + Date.now();
    const loaderDiv = document.createElement('div');
    loaderDiv.id = loadingId;
    loaderDiv.className = "message ai-message shamaa-loader";
    loaderDiv.innerHTML = `
        <div class="shamaa-pulse">E</div>
        <span style="font-size: 13px; color: #666; font-weight: bold;">الشماع يجهز الرد...</span>
    `;
    chatBox.appendChild(loaderDiv);
    chatBox.scrollTop = chatBox.scrollHeight;

    try {
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": "Bearer " + API_KEY,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "llama-3.3-70b-versatile",
                messages: messagesHistory,
                temperature: 0.6,
                max_tokens: 1000
            })
        });

        const data = await response.json();

        // إزالة لوجو التحميل فور وصول الرد
        loaderDiv.remove();

        if (response.ok) {
            const aiResponse = data.choices[0].message.content;
            
            // إضافة رد البوت للذاكرة وللواجهة
            messagesHistory.push({ role: "assistant", content: aiResponse });
            addMessage(aiResponse, 'ai-message');
        } else {
            addMessage("نعتذر، حدث خطأ في الاتصال بالسيرفر. حاول مرة أخرى.", 'ai-message');
        }

    } catch (error) {
        loaderDiv.remove();
        console.error("Error:", error);
        addMessage("تأكد من اتصالك بالإنترنت وحاول مجدداً.", 'ai-message');
    }
}

// 5. وظيفة إضافة الرسائل وتنسيقها
function addMessage(text, className) {
    const msgDiv = document.createElement('div');
    msgDiv.className = `message ${className}`;
    
    // إذا كان الرد من البوت، نستخدم مكتبة marked لتحويل الـ Markdown إلى HTML
    if (className === 'ai-message') {
        msgDiv.innerHTML = typeof marked !== 'undefined' ? marked.parse(text) : text;
    } else {
        msgDiv.innerText = text;
    }
    
    chatBox.appendChild(msgDiv);
    
    // سكرول تلقائي لأسفل الشات
    chatBox.scrollTop = chatBox.scrollHeight;
}

// 6. الاستماع لأحداث الضغط (Click & Enter)
searchBtn.addEventListener('click', sendMessage);

userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendMessage();
    }
});
