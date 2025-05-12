import config from '../../lib/config';
import { Telegraf } from 'telegraf';

export default async function handler(req, res) {
  try {
    // Проверяем секретный ключ
    const { secret } = req.query;
    if (!secret || secret !== process.env.WEBHOOK_SETUP_SECRET) {
      res.status(403).json({ ok: false, message: 'Unauthorized' });
      return;
    }

    // Собираем информацию о системе
    const systemInfo = {
      nodeVersion: process.version,
      platform: process.platform,
      memoryUsage: process.memoryUsage(),
      env: {
        NODE_ENV: process.env.NODE_ENV,
        VERCEL_URL: config.VERCEL_URL,
        isProduction: process.env.NODE_ENV === 'production',
        telegrafConfigured: !!config.TELEGRAM_BOT_TOKEN,
        googleSheetsConfigured: !!(config.GOOGLE_SHEET_ID && config.GOOGLE_CLIENT_EMAIL),
        adminConfigured: !!config.ADMIN_TELEGRAM_ID
      }
    };

    // Тестируем кодировку
    const cyrillicText = "Проверка кириллицы";
    const encodings = {
      raw: cyrillicText,
      buffer: Buffer.from(cyrillicText).toString('hex'),
      base64: Buffer.from(cyrillicText).toString('base64'),
      utf8: Buffer.from(cyrillicText).toString('utf8')
    };

    // Тестируем соединение с Telegram API
    let telegramStatus = 'Не настроен';
    if (config.TELEGRAM_BOT_TOKEN) {
      try {
        const bot = new Telegraf(config.TELEGRAM_BOT_TOKEN);
        const botInfo = await bot.telegram.getMe();
        telegramStatus = {
          connected: true,
          botInfo
        };
      } catch (error) {
        telegramStatus = {
          connected: false,
          error: error.message
        };
      }
    }

    // Проверяем URL для вебхука
    let webhookUrl = config.VERCEL_URL;
    if (!webhookUrl.startsWith('http')) {
      webhookUrl = `https://${webhookUrl}`;
    }
    webhookUrl = `${webhookUrl}/api/telegram`;

    res.status(200).json({
      ok: true,
      timestamp: new Date().toISOString(),
      system: systemInfo,
      encodingTests: encodings,
      telegramStatus,
      webhookUrl
    });
  } catch (error) {
    console.error('Ошибка при диагностике:', error);
    res.status(500).json({ ok: false, error: error.message, stack: error.stack });
  }
} 