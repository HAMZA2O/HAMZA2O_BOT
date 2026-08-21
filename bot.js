const { Telegraf } = require('telegraf');

// المفتاح الخاص بك
const GEMINI_API_KEY = 'AQ.Ab8RN6Jg4uYpjIDBB8M3vl5en1EaN-Qs1nzuSnEf0VKZEwjYiA'; 
const TELEGRAM_TOKEN = '8371410810:AAFaaZ5HggAgJVC19qCZ5iLgP6wcr5jqb3s';

const bot = new Telegraf(TELEGRAM_TOKEN);

// قائمة النماذج المتاحة على نفس المفتاح للتنقل بينها في حال الوصول للحد الأقصى
const MODELS = [
    'gemini-1.5-flash',
    'gemini-1.5-flash-8b',
    'gemini-1.5-pro'
];

async function generateGeminiContent(text) {
    for (const model of MODELS) {
        try {
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${GEMINI_API_KEY}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: text }] }]
                })
            });

            const data = await response.json();

            if (data.candidates && data.candidates[0]?.content?.parts[0]?.text) {
                return data.candidates[0].content.parts[0].text;
            }
        } catch (e) {
            console.log(`فشل النموذج ${model}، جاري المحاولة مع النموذج التالي...`);
        }
    }
    throw new Error('تم استهلاك الحدود المجانية لجميع النماذج المتاحة حالياً.');
}

bot.on('message', async (ctx) => {
    const text = ctx.message?.text;
    if (!text || text.startsWith('/')) return;

    const extraOptions = { reply_to_message_id: ctx.message.message_id };
    if (ctx.message.message_thread_id) extraOptions.message_thread_id = ctx.message.message_thread_id;

    try {
        await ctx.sendChatAction('typing', extraOptions).catch(() => {});

        const replyText = await generateGeminiContent(text);
        await ctx.reply(replyText, extraOptions);

    } catch (error) {
        console.error('⚠️ Error:', error);
        await ctx.reply(`⚠️ حدث خطأ:\n${error.message}`, extraOptions).catch(() => {});
    }
});

bot.launch();
