// 1. إعداد العناصر الأساسية
const chatBox = document.getElementById('chat-box');
const userInput = document.getElementById('user-input');
const searchBtn = document.getElementById('search-btn');

// مفتاح API (Groq)
const API_KEY = "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"; 

// --- إعدادات Firebase ---
const firebaseConfig = {
  apiKey: "AIzaSyAxMe4Sww_i_O3e_MQXn1dcgkRdKQh6pks",
  authDomain: "elshamaa-ai.firebaseapp.com",
  databaseURL: "https://elshamaa-ai-default-rtdb.firebaseio.com",
  projectId: "elshamaa-ai",
  storageBucket: "elshamaa-ai.firebasestorage.app",
  messagingSenderId: "764546614549",
  appId: "1:764546614549:web:0a766032decbf76dcb151c"
};

// توليد أو استعادة رقم تعريف العميل (للتفريق بين العملاء في لوحة التحكم)
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

// وظيفة حفظ الرسائل وتحديث لوحة التحكم
function syncWithFirebase(role, text) {
    if (typeof database !== 'undefined') {
        const chatRef = database.ref('chats/' + sessionId);
        
        // حفظ الرسالة في سجل المحادثة
        chatRef.child('messages').push({
            role: role,
            text: text,
            timestamp: Date.now()
        });

        // تحديث البيانات الأساسية لتظهر في قائمة لوحة التحكم
        chatRef.child('metadata').set({
            lastMessage: text,
            lastUpdate: Date.now(),
            status: "online"
        });
    }
}

// 2. ذاكرة المحادثة (تم استعادة النص الكامل كما طلبة)
let messagesHistory = [
    { 
        role: "system", 
        content: `أنت المساعد الذكي الرسمي لشركة "الشماع للبرمجيات والنظم" (ELSHAMAA Tech).
        
        بيانات التواصل الرسمية للشركة:
        - رقم الموبايل والواتساب: 01122884885
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
// جعلها متاحة عالمياً لتعمل مع HTML onclick
window.sendQuickMsg = sendQuickMsg;

// 4. الوظيفة الأساسية لإرسال واستقبال الرسائل
async function sendMessage() {
    const text = userInput.value.trim();
    if (text === "") return;

    // إضافة رسالة المستخدم للواجهة وحفظها في Firebase
    addMessage(text, 'user-message');
    messagesHistory.push({ role: "user", content: text });
    syncWithFirebase("user", text);
    
    userInput.value = "";
    
    // إظهار لوجو التحميل
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
        loaderDiv.remove();

        if (response.ok) {
            const aiResponse = data.choices[0].message.content;
            
            // إضافة رد البوت للذاكرة وللواجهة ولـ Firebase
            messagesHistory.push({ role: "assistant", content: aiResponse });
            addMessage(aiResponse, 'ai-message');
            syncWithFirebase("assistant", aiResponse);
        } else {
            addMessage("نعتذر، حدث خطأ في الاتصال بالسيرفر. حاول مرة أخرى.", 'ai-message');
        }

    } catch (error) {
        if(document.getElementById(loadingId)) loaderDiv.remove();
        console.error("Error:", error);
        addMessage("تأكد من اتصالك بالإنترنت وحاول مجدداً.", 'ai-message');
    }
}

// 5. وظيفة إضافة الرسائل وتنسيقها
function addMessage(text, className) {
    const msgDiv = document.createElement('div');
    msgDiv.className = `message ${className}`;
    
    if (className === 'ai-message') {
        // تحويل Markdown لـ HTML إذا كانت المكتبة موجودة
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
    if (e.key === 'Enter') {
        sendMessage();
    }
});
