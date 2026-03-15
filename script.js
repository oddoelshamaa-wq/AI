// 1. الإعدادات الأساسية
const chatBox = document.getElementById('chat-box');
const userInput = document.getElementById('user-input');
const searchBtn = document.getElementById('search-btn');

// تنبيه أمني: في الإنتاج الفعلي، يجب نقل هذا المفتاح لسيرفر خلفي (Backend)
const API_KEY = "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"; 

// 2. ذاكرة المحادثة (عشان البوت يفتكر الكلام اللي فات)
let messagesHistory = [
    { 
        role: "system", 
        content: `أنت المساعد الذكي الرسمي لشركة "الشماع للبرمجيات والنظم" (ELSHAMAA Tech).
        هويتك: خبير تقني ومسؤول مبيعات ودود.
        خدمات شركتنا: 
        1. تصميم وبرمجة مواقع الويب الاحترافية (Corporate Websites).
        2. بناء المتاجر الإلكترونية (E-commerce).
        3. تطوير أنظمة الإدارة المتكاملة (ERP, CRM, POS).
        4. تطبيقات الموبايل (Android & iOS).
        5. خدمات الاستضافة والتسويق الرقمي.
        
        تعليمات الرد:
        - ابدأ دائماً بالترحيب بالعميل بأسلوب راقٍ.
        - إذا سأل العميل عن تكلفة، اطلب منه تفاصيل المشروع لتقديم عرض سعر دقيق.
        - حاول إقناع العميل بجودة أنظمتنا وسرعتها.
        - استخدم لغة عربية احترافية وسهلة، واستخدم الإيموجي المناسبة للبيزنس.
        - إذا سأل عن التواصل، وجهه لترك رسالة هنا أو التواصل عبر واتساب الشركة.` 
    }
];

// 3. وظيفة إرسال الرسالة
async function sendMessage() {
    const text = userInput.value.trim();
    if (text === "") return;

    // إضافة رسالة المستخدم للواجهة وللتاريخ
    addMessage(text, 'user-message');
    messagesHistory.push({ role: "user", content: text });
    
    userInput.value = "";
    
    // رسالة انتظار
    const loadingId = addMessage("جاري تحضير الرد... ✨", 'ai-message');

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
                temperature: 0.6, // درجة الإبداع (0.6 مناسبة للبيزنس)
                max_tokens: 1000
            })
        });

        const data = await response.json();

        if (response.ok) {
            const aiResponse = data.choices[0].message.content;
            
            // إضافة رد البوت للتاريخ (عشان يفتكره في السؤال اللي جاي)
            messagesHistory.push({ role: "assistant", content: aiResponse });
            
            // تحديث الواجهة بالرد المنسق
            updateMessage(loadingId, aiResponse);
        } else {
            updateMessage(loadingId, "نعتذر، واجهت مشكلة تقنية بسيطة. حاول مرة أخرى.");
        }

    } catch (error) {
        console.error("Error:", error);
        updateMessage(loadingId, "تأكد من اتصالك بالإنترنت، وحاول مجدداً.");
    }
}

// 4. وظائف المساعدة للواجهة
function addMessage(text, className) {
    const msgDiv = document.createElement('div');
    msgDiv.className = `message ${className}`;
    
    // إذا كان البوت، نستخدم marked لتحويل الـ Markdown لـ HTML
    if (className === 'ai-message') {
        msgDiv.innerHTML = typeof marked !== 'undefined' ? marked.parse(text) : text;
    } else {
        msgDiv.innerText = text;
    }

    const messageId = "msg-" + Date.now();
    msgDiv.id = messageId;
    
    chatBox.appendChild(msgDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
    return messageId;
}

function updateMessage(id, newText) {
    const msgDiv = document.getElementById(id);
    if (msgDiv) {
        // تحويل الرد النهائي لشكل احترافي
        msgDiv.innerHTML = typeof marked !== 'undefined' ? marked.parse(newText) : newText;
        chatBox.scrollTop = chatBox.scrollHeight;
    }
}

// 5. الأحداث (Events)
searchBtn.addEventListener('click', sendMessage);
userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
});
