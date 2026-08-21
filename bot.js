const { Telegraf } = require('telegraf');

// توكن مايكروسوفت/جيت هب المباشر
const GITHUB_TOKEN = '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'; 
const TELEGRAM_TOKEN = '8371410810:AAFaaZ5HggAgJVC19qCZ5iLgP6wcr5jqb3s';

const bot = new Telegraf(TELEGRAM_TOKEN);

bot.on('message', async (ctx) => {
    const text = ctx.message?.text;
    if (!text || text.startsWith('/')) return;

    const extraOptions = { reply_to_message_id: ctx.message.message_id };
    if (ctx.message.message_thread_id) extraOptions.message_thread_id = ctx.message.message_thread_id;

    try {
        await ctx.sendChatAction('typing', extraOptions).catch(() => {});

        // طلب الاستجابة من سيرفر مايكروسوفت (GitHub Models - GPT-4o Mini)
        const response = await fetch('https://models.inference.ai.azure.com/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${GITHUB_TOKEN}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'gpt-4o-mini',
                messages: [{ role: 'user', content: text }]
            })
        });

        const data = await response.json();

        if (data.choices && data.choices[0]?.message?.content) {
            await ctx.reply(data.choices[0].message.content, extraOptions);
        } else {
            console.error('API Error:', data);
            await ctx.reply(`⚠️ تعذر الرد:\n${data.error?.message || 'خطأ غير معروف من سيرفر مايكروسوفت'}`, extraOptions);
        }
    } catch (error) {
        console.error('⚠️ Error:', error);
        await ctx.reply(`⚠️ حدث خطأ:\n${error.message}`, extraOptions).catch(() => {});
    }
});

bot.launch();
