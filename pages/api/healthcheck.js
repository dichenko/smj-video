import config from '../../lib/config';

export default async function handler(req, res) {
  // Проверяем, настроены ли базовые переменные окружения
  const checks = {
    telegram_token: !!config.TELEGRAM_BOT_TOKEN,
    vercel_url: !!config.VERCEL_URL,
    admin_id: !!config.ADMIN_TELEGRAM_ID,
    google_sheets: !!(config.GOOGLE_SHEET_ID && config.GOOGLE_CLIENT_EMAIL && config.GOOGLE_PRIVATE_KEY)
  };

  // Вывод значения VERCEL_URL для отладки
  const vercelUrlDisplay = config.VERCEL_URL || 'Не настроен';

  // Общий статус - все проверки должны быть true
  const allConfigured = Object.values(checks).every(Boolean);

  // Для GET запросов возвращаем страницу статуса
  if (req.method === 'GET') {
    const htmlStatus = allConfigured 
      ? '<span style="color:green">✓ Все настройки корректны</span>' 
      : '<span style="color:red">✗ Некоторые настройки отсутствуют</span>';

    const htmlChecks = Object.entries(checks).map(([key, value]) => {
      const status = value 
        ? '<span style="color:green">✓</span>' 
        : '<span style="color:red">✗</span>';
      return `<li>${status} ${key}${key === 'vercel_url' ? `: ${vercelUrlDisplay}` : ''}</li>`;
    }).join('');

    const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Статус SMJ Video Bot</title>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; line-height: 1.6; }
          h1 { color: #333; }
          ul { list-style-type: none; padding: 0; }
          li { margin: 10px 0; }
          .footer { margin-top: 40px; font-size: 12px; color: #666; }
          .action-button { display: inline-block; background: #0088cc; color: white; text-decoration: none; padding: 8px 12px; border-radius: 4px; margin: 5px 0; font-weight: bold; }
          .action-section { background: #f9f9f9; padding: 15px; border-radius: 8px; margin-top: 20px; }
          .warning { color: red; font-weight: bold; }
        </style>
      </head>
      <body>
        <h1>Статус SMJ Video Bot</h1>
        <p>Текущее время сервера: ${new Date().toLocaleString('ru-RU')}</p>
        <h2>Общий статус: ${htmlStatus}</h2>
        <h3>Проверки конфигурации:</h3>
        <ul>${htmlChecks}</ul>
        
        <div class="action-section">
          <h3>Действия для устранения проблем</h3>
          <p><span class="warning">Внимание!</span> Не забудьте заменить YOUR_SECRET на ваш секретный ключ.</p>
          
          <p><a class="action-button" href="/api/resetWebhook?secret=YOUR_SECRET" target="_blank">Сбросить и переустановить вебхук</a></p>
          <p>Полностью удаляет старый вебхук, очищает очередь обновлений и устанавливает новый вебхук.</p>
          
          <p><a class="action-button" href="/api/setupWebhook?secret=YOUR_SECRET" target="_blank">Настроить вебхук</a></p>
          <p>Обновляет настройки вебхука без сброса очереди.</p>
          
          <p><a class="action-button" href="/api/debugWebhook?secret=YOUR_SECRET" target="_blank">Проверить настройки вебхука</a></p>
          <p>Показывает текущие настройки вебхука и отправляет тестовое сообщение администратору.</p>
          
          <p><a class="action-button" href="/api/diagnostics?secret=YOUR_SECRET" target="_blank">Запустить полную диагностику</a></p>
          <p>Собирает информацию о системе, проверяет кодировку и соединение с Telegram API.</p>
        </div>
        
        <div class="footer">
          <p>Для использования этих функций замените YOUR_SECRET на значение переменной WEBHOOK_SETUP_SECRET из настроек окружения.</p>
          <p>Версия приложения: 1.0.1</p>
        </div>
      </body>
    </html>
    `;
    
    res.setHeader('Content-Type', 'text/html');
    res.status(allConfigured ? 200 : 500).send(html);
    return;
  }

  // Для запросов других типов возвращаем JSON
  res.status(allConfigured ? 200 : 500).json({
    ok: allConfigured,
    checks,
    vercel_url: vercelUrlDisplay,
    timestamp: new Date().toISOString()
  });
} 