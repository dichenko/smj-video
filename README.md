# Телеграм Бот для отчетности по видеозаписям

Бот для сотрудников организации для удобной сдачи отчетности по видеозаписям занятий. Разработан на Next.js с использованием Telegraf и Google Sheets для хранения данных.

## Функциональность

- Сбор отчетности о проведенных занятиях
- Сохранение данных в Google Sheets
- Уведомления администратора о новых отчетах
- Удобный интерфейс с использованием инлайн-кнопок

## Технический стек

- Next.js
- Telegraf.js (Telegram Bot API)
- Google Sheets API
- Деплой на Vercel

## Установка и запуск

### Предварительные требования

1. Node.js (версия 14 или выше)
2. Telegram Bot Token (создается через [@BotFather](https://t.me/BotFather))
3. Google Cloud проект с активированным API Google Sheets
4. Сервисный аккаунт Google с доступом к Google Sheets

### Настройка Google Sheets

1. Создайте новый проект в [Google Cloud Console](https://console.cloud.google.com/)
2. Активируйте Google Sheets API для этого проекта
3. Создайте сервисный аккаунт и загрузите ключ в формате JSON
4. Создайте новую Google Таблицу и предоставьте доступ на редактирование сервисному аккаунту
5. Запишите ID Google Таблицы (находится в URL таблицы)

### Настройка переменных окружения

1. Скопируйте файл `.env.example` в файл `.env.local`
2. Заполните все переменные окружения:
   - `TELEGRAM_BOT_TOKEN`: токен Telegram бота
   - `GOOGLE_SHEET_ID`: ID Google таблицы
   - `GOOGLE_CLIENT_EMAIL`: email сервисного аккаунта
   - `GOOGLE_PRIVATE_KEY`: приватный ключ сервисного аккаунта (с кавычками)
   - `ADMIN_TELEGRAM_ID`: ID администратора в Telegram (для получения уведомлений)
   - `WEBHOOK_SETUP_SECRET`: секретный ключ для настройки вебхука
   - `VERCEL_URL`: URL вашего проекта на Vercel

### Локальный запуск

```bash
# Установка зависимостей
npm install

# Запуск для разработки
npm run dev
```

В режиме разработки бот работает через long polling.

### Деплой на Vercel

1. Настройте проект на [Vercel](https://vercel.com)
2. Добавьте все переменные окружения в настройках проекта
3. После деплоя настройте вебхук, посетив URL:
   `https://your-project-url.vercel.app/api/setupWebhook?secret=your_webhook_setup_secret`

## Структура проекта

- `/api` - API маршруты Next.js
- `/constants` - константы и тексты сообщений
- `/lib` - основная логика приложения
  - `googleSheets.js` - интеграция с Google Sheets
  - `telegramBot.js` - основная логика бота
  - `utils.js` - вспомогательные функции
  - `config.js` - конфигурация и переменные окружения
- `/pages` - страницы Next.js
  - `/api/telegram.js` - вебхук для Telegram бота
  - `/api/setupWebhook.js` - настройка вебхука
  - `index.js` - главная страница 