import Head from 'next/head';

export default function Home() {
  return (
    <div>
      <Head>
        <title>Telegram Бот для отчетности</title>
        <meta name="description" content="Бот для сотрудников организации для удобной сдачи отчетности по видеозаписям" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        padding: '0 2rem',
        textAlign: 'center',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '1.5rem' }}>
          Telegram Бот для отчетности по видеозаписям
        </h1>

        <p style={{ fontSize: '1.25rem', maxWidth: '600px', lineHeight: '1.6', marginBottom: '2rem' }}>
          Бот для сотрудников организации для удобной сдачи отчетности по видеозаписям занятий.
          Используйте бота для отправки отчетов о проведенных занятиях, оценки успешности и получения обратной связи.
        </p>

        <div style={{ marginBottom: '2rem' }}>
          <a
            href="https://t.me/your_bot_username"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-block',
              background: '#0088cc',
              color: 'white',
              textDecoration: 'none',
              padding: '0.75rem 1.5rem',
              borderRadius: '5px',
              fontWeight: 'bold',
              transition: 'background 0.3s',
              fontSize: '1.1rem'
            }}
          >
            Открыть бота в Telegram
          </a>
        </div>

        <div style={{
          background: '#f5f5f5',
          padding: '1.5rem',
          borderRadius: '8px',
          maxWidth: '600px'
        }}>
          <h2 style={{ marginTop: 0, color: '#333' }}>Возможности бота</h2>
          <ul style={{ textAlign: 'left', lineHeight: '1.6' }}>
            <li>Отправка отчетов по видеозаписям занятий</li>
            <li>Автоматическое сохранение данных в базе</li>
            <li>Оценка различных аспектов проведенного занятия</li>
            <li>Моментальные уведомления для администраторов</li>
          </ul>
        </div>
      </main>
    </div>
  );
} 