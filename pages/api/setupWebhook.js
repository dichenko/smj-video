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

    // Получаем базовый URL для вебхука
    let webhookUrl = config.VERCEL_URL;
    
    // Проверяем, есть ли протокол в URL
    if (!webhookUrl.startsWith('http')) {
      webhookUrl = `https://${webhookUrl}`;
    }
    
    // Добавляем путь API
    webhookUrl = `${webhookUrl}/api/telegram`;
    
    console.log(`Устанавливаем вебхук на URL: ${webhookUrl}`);

    // Создаем экземпляр бота
    const bot = new Telegraf(config.TELEGRAM_BOT_TOKEN);

    // Удаляем текущий вебхук
    await bot.telegram.deleteWebhook();

    // Устанавливаем новый вебхук
    await bot.telegram.setWebhook(webhookUrl);

    // Получаем информацию о вебхуке
    const webhookInfo = await bot.telegram.getWebhookInfo();

    res.status(200).json({
      ok: true,
      message: 'Webhook setup completed',
      webhook: webhookInfo,
      url_used: webhookUrl
    });
  } catch (error) {
    console.error('Ошибка при установке вебхука:', error);
    res.status(500).json({ ok: false, error: error.message });
  }
} 