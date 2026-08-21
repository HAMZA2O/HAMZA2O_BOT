const { Telegraf } = require('telegraf');

const GEMINI_API_KEY = 'AQ.Ab8RN6KshkEC2uhVlOMvxs0BK1R_gyrIZOnG5Gvghl3Xvty6UA'; 
const TELEGRAM_TOKEN = '8371410810:AAFaaZ5HggAgJVC19qCZ5iLgP6wcr5jqb3s';

const bot = new Telegraf(TELEGRAM_TOKEN);

bot.on('message', async (ctx) => {
    const text = ctx.message?.text;
    if (!text || text.startsWith('/')) return;

    const extraOptions = { reply_to_message_id: ctx.message.message_id };
    if (ctx.message.message_thread_id) extraOptions.message_thread_id = ctx.message.message_thread_id;

    try {
        await ctx.sendChatAction('typing', extraOptions).catch(() => {});

        const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent', {
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
            const replyText = data.candidates[0].content.parts[0].text;
            await ctx.reply(replyText, extraOptions);
        } else {
            console.error('API Error Details:', JSON.stringify(data));
            await ctx.reply(`⚠️ تعذر الرد:\n${data.error?.message || 'خطأ في التوثيق من سيرفر جوجل'}`, extraOptions);
        }
    } catch (error) {
        console.error('⚠️ Error:', error);
        await ctx.reply(`⚠️ حدث خطأ:\n${error.message}`, extraOptions).catch(() => {});
    }
});

bot.launch();
