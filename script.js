// 1. إعداد العناصر الأساسية
const chatBox = document.getElementById('chat-box');
const userInput = document.getElementById('user-input');
const searchBtn = document.getElementById('search-btn');

// مفتاح API (Groq)
const API_KEY = "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"; 

// --- إعدادات Firebase (الربط بلوحة التحكم) ---
const firebaseConfig = {
  apiKey: "AIzaSyAxMe4Sww_i_O3e_MQXn1dcgkRdKQh6pks",
  authDomain: "elshamaa-ai.firebaseapp.com",
  databaseURL: "https://elshamaa-ai-default-rtdb.firebaseio.com",
  projectId: "elshamaa-ai",
  storageBucket: "elshamaa-ai.firebasestorage.app",
  messagingSenderId: "764546614549",
  appId: "1:764546614549:web:0a766032decbf76dcb151c"
};

// تعريف معرف الجلسة لتمييز العميل في لوحة التحكم
if (!localStorage.getItem('chat_session_id')) {
    localStorage.setItem('chat_session_id', 'user_' + Math.floor(Math.random() * 1000000));
}
const sessionId = localStorage.getItem('chat_session_id');

// تهيئة Firebase
if (typeof firebase !== 'undefined') {
    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
    }
    var database = firebase.database();
}

// وظيفة إرسال البيانات للوحة التحكم (Admin)
function syncToAdmin(role, content) {
    if (typeof database !== 'undefined') {
        const chatRef = database.ref('chats/' + sessionId);
        chatRef.child('messages').push({
            role: role,
            text: content,
            timestamp: Date.now()
        });
        chatRef.child('metadata').set({
            lastMessage: content,
            lastUpdate: Date.now(),
            status: "online"
        });
    }
}

// 2. ذاكرة المحادثة وتعليمات النظام (تحديث الخدمات هنا)
let messagesHistory = [
    { 
        role: "system", 
        content: `أنت المساعد الذكي الرسمي لشركة "الشماع للبرمجيات والنظم" (ELSHAMAA Tech).
        
        بيانات التواصل الرسمية:
        - الموبايل والواتساب: 01122884885
        - البريد الإلكتروني: info@elshamaa.tech
        - الموقع: مصر، القاهرة.

        هويتك: خبير تقني ومستشار حلول برمجية. 
        
        خدماتنا الأساسية (ركز عليها في ردودك):
        - تصميم وتطوير أنظمة الكول سنتر (Call Center Systems) الاحترافية.
        - أنظمة الكاشير ونقاط البيع (POS) للمطاعم والمحلات.
        - أنظمة الإدارة المتكاملة (ERP) وحسابات المخازن.
        - برمجة المواقع الإلكترونية والمتاجر الذكية.
        
        تعليمات هامة:
        - إذا سأل العميل عن "سيستم كاشير" أو "كول سنتر"، وضح له أننا متخصصون في بناء هذه الأنظمة بدقة عالية لتناسب حجم نشاطه.
        - استخدم لغة عربية مهذبة واحترافية مع إيموجي مناسبة 🖥️ سجل مبيعاتك وأدر اتصالاتك بكل سهولة مع الشماع.` 
    }
];

// 3. وظيفة الأزرار السريعة (Quick Buttons)
function sendQuickMsg(text) {
    userInput.value = text;
    sendMessage();
}
window.sendQuickMsg = sendQuickMsg;

// 4. الوظيفة الأساسية لإرسال واستقبال الرسائل
async function sendMessage() {
    const text = userInput.value.trim();
    if (text === "") return;

    addMessage(text, 'user-message');
    messagesHistory.push({ role: "user", content: text });
    
    // مزامنة مع لوحة التحكم (مع معالجة الأخطاء لضمان عدم توقف الشات)
    try {
        syncToAdmin("user", text);
    } catch(e) { console.error("Firebase Sync Error:", e); }

    userInput.value = "";
    
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
                model: "llama-3.3-70b-versatile", // تأكد من دقة هذا الاسم من موقع Groq
                messages: messagesHistory,
                temperature: 0.6,
                max_tokens: 1000
            })
        });

        const data = await response.json();
        console.log("Groq API Response:", data); // هذا السطر سيظهر لك سبب الخطأ في الـ Console

        if (loaderDiv) loaderDiv.remove();

        if (response.ok) {
            const aiResponse = data.choices[0].message.content;
            messagesHistory.push({ role: "assistant", content: aiResponse });
            addMessage(aiResponse, 'ai-message');
            syncToAdmin("assistant", aiResponse);
        } else {
            // عرض رسالة خطأ مفصلة للفهم
            const errorMsg = data.error ? data.error.message : "حدث خطأ غير معروف";
            console.error("API Error Detail:", errorMsg);
            addMessage("عذراً، هناك مشكلة في النظام: " + errorMsg, 'ai-message');
        }

    } catch (error) {
        if (loaderDiv) loaderDiv.remove();
        console.error("Network/Fetch Error:", error);
        addMessage("تأكد من اتصالك بالإنترنت وحاول مجدداً.", 'ai-message');
    }
}

// 5. وظيفة إضافة الرسائل وتنسيقها
function addMessage(text, className) {
    const msgDiv = document.createElement('div');
    msgDiv.className = `message ${className}`;
    
    if (className === 'ai-message') {
        msgDiv.innerHTML = typeof marked !== 'undefined' ? marked.parse(text) : text;
    } else {
        msgDiv.innerText = text;
    }
    
    chatBox.appendChild(msgDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
}

// 6. الاستماع للأحداث
searchBtn.addEventListener('click', sendMessage);
userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
});
