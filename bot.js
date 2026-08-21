const { Telegraf } = require('telegraf');
const { Telegraf } = require('telegraf');

const GEMINI_API_KEY = 'AQ.Ab8RN6LiQUznYhU1ah3SqllIItDKU1Wg202E9zM1LeGQF7y2uA'; 
const TELEGRAM_TOKEN = '8371410810:AAFaaZ5HggAgJVC19qCZ5iLgP6wcr5jqb3s';

const bot = new Telegraf(TELEGRAM_TOKEN);

bot.on('message', async (ctx) => {
    const text = ctx.message?.text;
    if (!text || text.startsWith('/')) return;

    const extraOptions = { reply_to_message_id: ctx.message.message_id };
    if (ctx.message.message_thread_id) extraOptions.message_thread_id = ctx.message.message_thread_id;

    try {
        await ctx.sendChatAction('typing', extraOptions).catch(() => {});

        // تمرير المفتاح كـ URL Query Parameter لتفادي مشكلة الـ OAuth
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [{ parts: [{ text: text }] }]
            })
        });

        const data = await response.json();

        if (data.candidates && data.candidates[0]?.content?.parts[0]?.text) {
            const replyText = data.candidates[0].content.parts[0].text;
            await ctx.reply(replyText, extraOptions);
        } else {
            console.error('API Error:', data);
            await ctx.reply(`⚠️ تعذر الرد:\n${data.error?.message || 'خطأ غير معروف'}`, extraOptions);
        }
    } catch (error) {
        console.error('⚠️ Error:', error);
        await ctx.reply(`⚠️ حدث خطأ:\n${error.message}`, extraOptions).catch(() => {});
    }
});

bot.launch();
