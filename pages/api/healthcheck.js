import config from '../../lib/config';

export default async function handler(req, res) {
  // Проверяем, настроены ли базовые переменные окружения
  const checks = {
    telegram_token: !!config.TELEGRAM_BOT_TOKEN,
    vercel_url: !!config.VERCEL_URL,
    admin_id: !!config.ADMIN_TELEGRAM_ID,
    google_sheets: !!(config.GOOGLE_SHEET_ID && config.GOOGLE_CLIENT_EMAIL && config.GOOGLE_PRIVATE_KEY)
  };

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
      return `<li>${status} ${key}</li>`;
    }).join('');

    const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Статус SMJ Video Bot</title>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; line-height: 1.6; }
          h1 { color: #333; }
          ul { list-style-type: none; padding: 0; }
          li { margin: 10px 0; }
          .footer { margin-top: 40px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <h1>Статус SMJ Video Bot</h1>
        <p>Текущее время сервера: ${new Date().toLocaleString('ru-RU')}</p>
        <h2>Общий статус: ${htmlStatus}</h2>
        <h3>Проверки конфигурации:</h3>
        <ul>${htmlChecks}</ul>
        <div class="footer">
          <p>Для настройки вебхука, перейдите по ссылке:<br>
          <code>/api/setupWebhook?secret=YOUR_SECRET</code></p>
          <p>Для проверки настроек вебхука, перейдите по ссылке:<br>
          <code>/api/debugWebhook?secret=YOUR_SECRET</code></p>
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
    timestamp: new Date().toISOString()
  });
} 