import { Telegraf } from 'telegraf';
import config from '../../lib/config';

export default async function handler(req, res) {
  try {
    // Проверяем секретный ключ
    const { secret } = req.query;
    if (!secret || secret !== process.env.WEBHOOK_SETUP_SECRET) {
      res.status(403).json({ ok: false, message: 'Unauthorized' });
      return;
    }

    // Проверяем наличие токена бота
    if (!config.TELEGRAM_BOT_TOKEN) {
      res.status(500).json({ ok: false, message: 'Telegram Bot Token not configured' });
      return;
    }

    // Создаем экземпляр бота
    const bot = new Telegraf(config.TELEGRAM_BOT_TOKEN);

    // Получаем информацию о вебхуке
    const webhookInfo = await bot.telegram.getWebhookInfo();

    // Получаем информацию о боте
    const botInfo = await bot.telegram.getMe();

    // Тестируем отправку сообщения администратору
    let adminMessageResult = null;
    if (config.ADMIN_TELEGRAM_ID) {
      try {
        const message = await bot.telegram.sendMessage(
          config.ADMIN_TELEGRAM_ID,
          'Это тестовое сообщение для проверки работы бота. Если вы его видите, значит бот может отправлять сообщения.'
        );
        adminMessageResult = { success: true, message_id: message.message_id };
      } catch (error) {
        adminMessageResult = { 
          success: false, 
          error: error.message,
          description: 'Бот не может отправить сообщение администратору. Возможно, администратор не отправлял сообщения боту ранее.'
        };
      }
    } else {
      adminMessageResult = {
        success: false,
        error: 'ADMIN_TELEGRAM_ID not configured'
      };
    }

    res.status(200).json({
      ok: true,
      message: 'Debug info retrieved',
      env: {
        NODE_ENV: process.env.NODE_ENV,
        VERCEL_URL: config.VERCEL_URL,
        ADMIN_ID_CONFIGURED: !!config.ADMIN_TELEGRAM_ID,
        GOOGLE_SHEETS_CONFIGURED: !!(config.GOOGLE_SHEET_ID && config.GOOGLE_CLIENT_EMAIL && config.GOOGLE_PRIVATE_KEY)
      },
      bot: {
        id: botInfo.id,
        username: botInfo.username,
        first_name: botInfo.first_name,
        can_join_groups: botInfo.can_join_groups,
        can_read_all_group_messages: botInfo.can_read_all_group_messages,
        supports_inline_queries: botInfo.supports_inline_queries
      },
      webhook: webhookInfo,
      admin_message_test: adminMessageResult
    });
  } catch (error) {
    console.error('Ошибка при получении информации о вебхуке:', error);
    res.status(500).json({ ok: false, error: error.message, stack: error.stack });
  }
} 