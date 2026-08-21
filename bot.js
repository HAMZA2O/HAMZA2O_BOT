const { Telegraf } = require('telegraf');
const { GoogleGenAI } = require('@google/genai');

// البيانات الخاصة بك
const TELEGRAM_TOKEN = '8371410810:AAFaaZ5HggAgJVC19qCZ5iLgP6wcr5jqb3s';
const LOG_GROUP_ID = '@HAMZA2O_bot_3'; 
const ADMIN_USER_ID = 123456789; // استبدله بـ ID حسابك الحقيقي إذا أردت استخدام /block

const API_KEYS = [
    'AQ.Ab8RN6LI56nKEn-1qeP6V2glGdEHvYOexxtFRQ43j_mE30mUCQ',
    'AQ.Ab8RN6JWJ8AH9zdj-IW3IPuL9LFdwjwWUT5erucREfpIG8SGwQ',
    'AQ.Ab8RN6JGDM8Mm1R2LehbFFBJAOe7IWrGPb4giEe7IFvjocaz6A'
];

const bannedUsers = new Set();
const bot = new Telegraf(TELEGRAM_TOKEN);

process.on('unhandledRejection', (reason) => {
    console.error('🛡️ [Unhandled Rejection]:', reason?.message || reason);
});

process.on('uncaughtException', (err) => {
    console.error('🛡️ [Uncaught Exception]:', err.message);
});

bot.catch((err) => {
    console.error(`⚠️ [خطأ تيليجرام]:`, err.message);
});

// أوامر الأدمن
bot.command('block', (ctx) => {
    if (ctx.from.id !== ADMIN_USER_ID) return;
    const targetId = parseInt(ctx.message.text.split(' ')[1]);
    if (!targetId) return ctx.reply('⚠️ اكتب الـ ID صحيح، مثال:\n`/block 123456789`', { parse_mode: 'Markdown' });

    bannedUsers.add(targetId);
    ctx.reply(`✅ تم حظر المستخدم (${targetId}) بنجاح.`);
});

bot.command('unblock', (ctx) => {
    if (ctx.from.id !== ADMIN_USER_ID) return;
    const targetId = parseInt(ctx.message.text.split(' ')[1]);
    if (!targetId) return ctx.reply('⚠️ اكتب الـ ID صحيح، مثال:\n`/unblock 123456789`', { parse_mode: 'Markdown' });

    bannedUsers.delete(targetId);
    ctx.reply(`✅ تم إلغاء حظر المستخدم (${targetId}).`);
});

bot.on('message', async (ctx) => {
    const userId = ctx.from.id;
    const userName = ctx.from.first_name || 'بدون اسم';
    const username = ctx.from.username ? `@${ctx.from.username}` : 'لا يوجد';
    const text = ctx.message?.text;
    const chatTitle = ctx.chat.title || 'جروب/محادثة';

    // تجاهل المحظورين والرسائل غير النصية والأوامر
    if (bannedUsers.has(userId) || !text || text.startsWith('/')) return;

    // تجهيز خيارات الرد لضمان الرد داخل نفس التابيك/الموضوع إن وجد
    const extraOptions = {
        reply_to_message_id: ctx.message.message_id
    };
    if (ctx.message.message_thread_id) {
        extraOptions.message_thread_id = ctx.message.message_thread_id;
    }

    // إرسال اللوج إلى جروب السجلات
    const escapeHtml = (str) => String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const logMessage = `🚨 <b>[رسالة جديدة في الجروب]</b>\n\n` +
                       `👥 <b>الجروب:</b> ${escapeHtml(chatTitle)}\n` +
                       `👤 <b>الاسم:</b> ${escapeHtml(userName)}\n` +
                       `🆔 <b>الـ ID:</b> <code>${userId}</code>\n` +
                       `🔗 <b>اليوزر:</b> ${escapeHtml(username)}\n` +
                       `💬 <b>الرسالة:</b> ${escapeHtml(text)}\n\n` +
                       `🔨 <b>للحظر:</b> <code>/block ${userId}</code>`;

    ctx.telegram.sendMessage(LOG_GROUP_ID, logMessage, { parse_mode: 'HTML' }).catch(() => {});

    // إظهار جاري الكتابة داخل الجروب
    await ctx.sendChatAction('typing', extraOptions).catch(() => {});

    // المحاولة عبر المفاتيح المتاحة
    let responded = false;
    for (let i = 0; i < API_KEYS.length; i++) {
        try {
            const ai = new GoogleGenAI({ apiKey: API_KEYS[i] });
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: text,
            });

            if (response.text) {
                await ctx.reply(response.text, extraOptions);
                responded = true;
                break;
            }
        } catch (error) {
            console.error(`خطأ في المفتاح رقم ${i + 1}:`, error.message);
        }
    }

    if (!responded) {
        await ctx.reply('⚠️ تعذر الرد حالياً، يرجى المحاولة لاحقاً.', extraOptions).catch(() => {});
    }
});

bot.launch().then(() => console.log('🚀 البوت يعمل حالياً ومستعد لاستقبال الرسائل في الجروبات...'));

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));