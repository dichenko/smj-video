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

    console.log('Получаем информацию о вебхуке');
    
    // Создаем экземпляр бота
    const bot = new Telegraf(config.TELEGRAM_BOT_TOKEN);

    // Получаем информацию о вебхуке
    const webhookInfo = await bot.telegram.getWebhookInfo();
    console.log('Получена информация о вебхуке:', webhookInfo);

    // Получаем информацию о боте
    const botInfo = await bot.telegram.getMe();
    console.log('Получена информация о боте:', botInfo);

    // Отправляем тестовое сообщение администратору
    let adminMessageResult = null;
    if (config.ADMIN_TELEGRAM_ID) {
      try {
        console.log('Отправляем тестовое сообщение администратору');
        const message = await bot.telegram.sendMessage(
          config.ADMIN_TELEGRAM_ID,
          `Проверка настроек вебхука в ${new Date().toLocaleString('ru-RU')}\n` +
          `URL вебхука: ${webhookInfo.url}\n` +
          `Ожидающих обновлений: ${webhookInfo.pending_update_count}\n` +
          `Последняя ошибка: ${webhookInfo.last_error_message || 'нет'}`
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
      message: 'Webhook info retrieved',
      webhook: webhookInfo,
      bot: botInfo,
      admin_message: adminMessageResult
    });
  } catch (error) {
    console.error('Ошибка при получении информации о вебхуке:', error);
    res.status(500).json({ ok: false, error: error.message, stack: error.stack });
  }
} 