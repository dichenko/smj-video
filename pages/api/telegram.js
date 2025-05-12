import { bot, startBot } from '../../lib/telegramBot';
import config from '../../lib/config';

// Простая функция логирования
const logMessage = (message) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${message}`);
};

// Обработчик вебхука Telegram
export default async function handler(req, res) {
  try {
    console.log(`[${new Date().toISOString()}] Получен запрос в telegram webhook`);
    console.log(`Метод: ${req.method}`);
    
    // Всегда отвечаем 200 OK на OPTIONS запросы (для CORS)
    if (req.method === 'OPTIONS') {
      res.status(200).end();
      return;
    }
    
    // Для GET запросов просто подтверждаем работу вебхука
    if (req.method === 'GET') {
      res.status(200).json({ ok: true, message: 'Telegram webhook is active' });
      return;
    }
    
    // Проверяем, что это POST запрос
    if (req.method !== 'POST') {
      console.log('Получен не POST запрос, возвращаем 200 OK');
      res.status(200).json({ ok: true, message: 'Telegram webhook is active' });
      return;
    }
    
    // Логируем заголовки запроса
    console.log('Заголовки запроса:', JSON.stringify(req.headers, null, 2));
    
    // Проверяем наличие тела запроса
    if (!req.body || Object.keys(req.body).length === 0) {
      console.log('Тело запроса пустое');
      res.status(200).json({ ok: true, message: 'Empty request body' });
      return;
    }
    
    // Логируем тело запроса (для отладки)
    console.log(`Тело запроса: ${JSON.stringify(req.body, null, 2)}`);
    
    // Асинхронно обрабатываем запрос от Telegram
    // Важно: сначала отправляем ответ, потом обрабатываем
    res.status(200).json({ ok: true });
    
    // Динамически импортируем bot для обработки
    const { bot } = await import('../../lib/telegramBot');
    
    // Обрабатываем обновление от Telegram (вне контекста ответа)
    setImmediate(async () => {
      try {
        console.log('Начинаем обработку запроса ботом');
        await bot.handleUpdate(req.body);
        console.log('Запрос успешно обработан ботом');
      } catch (botError) {
        console.error('Ошибка при обработке запроса ботом:', botError);
      }
    });
  } catch (error) {
    console.error('Общая ошибка в API-маршруте Telegram:', error);
    // Всегда возвращаем 200, чтобы Telegram не повторял запросы
    res.status(200).json({ ok: true, error: error.message });
  }
}

// Запускаем бота в режиме разработки
if (process.env.NODE_ENV !== 'production') {
  console.log('Запуск бота в режиме разработки (polling)');
  // Динамически импортируем startBot для запуска
  import('../../lib/telegramBot').then(({ startBot }) => {
    startBot();
  }).catch(error => {
    console.error('Ошибка при запуске бота в режиме разработки:', error);
  });
} else {
  console.log('Бот в режиме production (webhook)');
} 