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

    console.log('Начинаем настройку вебхука');
    
    // Создаем экземпляр бота
    const bot = new Telegraf(config.TELEGRAM_BOT_TOKEN);

    // Получаем базовый URL для вебхука
    let webhookUrl = config.VERCEL_URL;
    
    // Проверяем, есть ли протокол в URL
    if (!webhookUrl.startsWith('http')) {
      webhookUrl = `https://${webhookUrl}`;
    }
    
    // Добавляем путь API
    webhookUrl = `${webhookUrl}/api/telegram`;
    
    console.log(`Устанавливаем вебхук на URL: ${webhookUrl}`);

    // Устанавливаем вебхук с максимальным количеством соединений
    await bot.telegram.setWebhook(webhookUrl, {
      max_connections: 100,
      allowed_updates: ['message', 'callback_query', 'inline_query']
    });
    console.log('Вебхук установлен');

    // Получаем информацию о вебхуке
    const webhookInfo = await bot.telegram.getWebhookInfo();
    console.log('Получена информация о вебхуке:', webhookInfo);

    // Отправляем тестовое сообщение администратору
    let adminMessageResult = null;
    if (config.ADMIN_TELEGRAM_ID) {
      try {
        console.log('Отправляем тестовое сообщение администратору');
        const message = await bot.telegram.sendMessage(
          config.ADMIN_TELEGRAM_ID,
          `Вебхук настроен в ${new Date().toLocaleString('ru-RU')}`
        );
        adminMessageResult = { success: true, message_id: message.message_id };
        console.log('Тестовое сообщение отправлено');
      } catch (error) {
        console.error('Ошибка при отправке сообщения администратору:', error);
        adminMessageResult = { 
          success: false, 
          error: error.message
        };
      }
    }

    res.status(200).json({
      ok: true,
      message: 'Webhook setup completed',
      webhook: webhookInfo,
      url_used: webhookUrl,
      admin_message: adminMessageResult
    });
  } catch (error) {
    console.error('Ошибка при настройке вебхука:', error);
    res.status(500).json({ ok: false, error: error.message, stack: error.stack });
  }
} 