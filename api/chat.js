// api/chat.js
export default async function handler(req, res) {
    const { message } = req.body;
    const API_KEY = process.env.GROQ_API_KEY; // هنا هنجيب المفتاح من إعدادات الموقع مش من الكود

    try {
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "llama3-8b-8192",
                messages: [{ role: "user", content: message }]
            })
        });

        const data = await response.json();
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: "حدث خطأ في السيرفر" });
    }
}
