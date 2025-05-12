import { bot, startBot } from '../../lib/telegramBot';
import config from '../../lib/config';

// Простая функция логирования
const logMessage = (message) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${message}`);
};

export default async function handler(req, res) {
  try {
    logMessage('Получен запрос к Telegram вебхуку');
    
    // Проверяем, что это POST запрос
    if (req.method !== 'POST') {
      logMessage('Получен не POST запрос');
      res.status(200).json({ ok: true, message: 'Webhook is active' });
      return;
    }

    // Логируем тело запроса
    logMessage(`Тело запроса: ${JSON.stringify(req.body, null, 2)}`);

    // Обрабатываем вебхук от Telegram
    try {
      await bot.handleUpdate(req.body);
      logMessage('Запрос успешно обработан ботом');
    } catch (botError) {
      logMessage(`Ошибка при обработке запроса ботом: ${botError.message}`);
      console.error('Полная ошибка:', botError);
    }
    
    res.status(200).json({ ok: true });
  } catch (error) {
    logMessage(`Общая ошибка в API-маршруте Telegram: ${error.message}`);
    console.error('Полная ошибка:', error);
    res.status(500).json({ ok: false, error: error.message });
  }
}

// Запускаем бота в режиме разработки с polling, в production - с вебхуком
if (process.env.NODE_ENV !== 'production') {
  if (config.TELEGRAM_BOT_TOKEN) {
    logMessage('Запуск бота в режиме разработки (polling)');
    startBot();
  } else {
    logMessage('TELEGRAM_BOT_TOKEN не найден, бот не запущен');
  }
} else {
  logMessage('Бот в режиме production (webhook)');
} 