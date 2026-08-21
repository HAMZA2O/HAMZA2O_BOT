const { Telegraf } = require('telegraf');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const GEMINI_API_KEY = 'AQ.Ab8RN6ItCiGOHkP1tHqADRNZKXMtIyJXuIpGasbiSrwKc2GG9w'; 
const TELEGRAM_TOKEN = '8371410810:AAFaaZ5HggAgJVC19qCZ5iLgP6wcr5jqb3s';

const bot = new Telegraf(TELEGRAM_TOKEN);
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

bot.on('message', async (ctx) => {
    const text = ctx.message?.text;
    if (!text || text.startsWith('/')) return;

    const extraOptions = { reply_to_message_id: ctx.message.message_id };
    if (ctx.message.message_thread_id) extraOptions.message_thread_id = ctx.message.message_thread_id;

    try {
        await ctx.sendChatAction('typing', extraOptions).catch(() => {});

        // تجربة النموذج الرسمي السريع
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent(text);
        const responseText = result.response.text();

        if (responseText) {
            await ctx.reply(responseText, extraOptions);
        }
    } catch (error) {
        console.error('⚠️ Error:', error);
        // إرسال تفاصيل الخطأ مباشرة إلى الشات لمعرفة السبب الحقيقي
        await ctx.reply(`⚠️ حدث خطأ:\n${error.message}`, extraOptions).catch(() => {});
    }
});

bot.launch();
