const { Telegraf } = require('telegraf');

const OPENROUTER_API_KEY = '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'; 
const TELEGRAM_TOKEN = '8371410810:AAFaaZ5HggAgJVC19qCZ5iLgP6wcr5jqb3s';

const bot = new Telegraf(TELEGRAM_TOKEN);

bot.on('message', async (ctx) => {
    const text = ctx.message?.text;
    if (!text || text.startsWith('/')) return;

    const extraOptions = { reply_to_message_id: ctx.message.message_id };
    if (ctx.message.message_thread_id) extraOptions.message_thread_id = ctx.message.message_thread_id;

    try {
        await ctx.sendChatAction('typing', extraOptions).catch(() => {});

        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'google/gemini-flash-1.5',
                messages: [{ role: 'user', content: text }]
            })
        });

        const data = await response.json();

        if (data.choices && data.choices[0]?.message?.content) {
            await ctx.reply(data.choices[0].message.content, extraOptions);
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
