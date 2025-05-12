const { bot } = require('../../lib/telegramBot');
const config = require('../../lib/config');

export default async function handler(req, res) {
  try {
    // Проверяем, что это POST запрос
    if (req.method !== 'POST') {
      res.status(200).json({ ok: true, message: 'Webhook is active' });
      return;
    }

    // Обрабатываем вебхук от Telegram
    await bot.handleUpdate(req.body);
    res.status(200).json({ ok: true });
  } catch (error) {
    console.error('Ошибка в API-маршруте Telegram:', error);
    res.status(500).json({ ok: false, error: error.message });
  }
}

// Запускаем бота в режиме разработки с polling, в production - с вебхуком
if (process.env.NODE_ENV !== 'production') {
  const { startBot } = require('../../lib/telegramBot');
  if (config.TELEGRAM_BOT_TOKEN) {
    startBot();
  }
} 