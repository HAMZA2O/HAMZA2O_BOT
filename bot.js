const { Telegraf } = require('telegraf');

const OPENROUTER_API_KEY = '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'; 
const TELEGRAM_TOKEN = '8371410810:AAFaaZ5HggAgJVC19qCZ5iLgP6wcr5jqb3s';

const bot = new Telegraf(TELEGRAM_TOKEN);

// قائمة النماذج التبادلية (إذا فشل نموذج ينتقل تلقائياً للذي يليه)
const MODELS = [
    'google/gemini-2.0-flash-lite-preview-02-05:free',
    'google/gemini-2.0-pro-exp-02-05:free',
    'meta-llama/llama-3.3-70b-instruct:free',
    'deepseek/deepseek-r1:free'
];

async function askOpenRouter(text) {
    for (const model of MODELS) {
        try {
            const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: model,
                    messages: [{ role: 'user', content: text }]
                })
            });

            const data = await response.json();

            if (data.choices && data.choices[0]?.message?.content) {
                return data.choices[0].message.content;
            }
        } catch (e) {
            console.log(`فشل النموذج ${model}، جاري التجربة على النموذج التالي...`);
        }
    }
    throw new Error('جميع النماذج المجانية المتاحة غير متوفرة حالياً، حاول لاحقاً.');
}

bot.on('message', async (ctx) => {
    const text = ctx.message?.text;
    if (!text || text.startsWith('/')) return;

    const extraOptions = { reply_to_message_id: ctx.message.message_id };
    if (ctx.message.message_thread_id) extraOptions.message_thread_id = ctx.message.message_thread_id;

    try {
        await ctx.sendChatAction('typing', extraOptions).catch(() => {});

        const replyText = await askOpenRouter(text);
        await ctx.reply(replyText, extraOptions);

    } catch (error) {
        console.error('⚠️ Error:', error);
        await ctx.reply(`⚠️ حدث خطأ:\n${error.message}`, extraOptions).catch(() => {});
    }
});

bot.launch();
