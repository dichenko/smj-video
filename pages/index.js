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
          Telegram Бот для отчетности
        </h1>

        <p style={{ fontSize: '1.25rem', maxWidth: '600px', lineHeight: '1.6' }}>
          Бот для сотрудников организации для удобной сдачи отчетности по видеозаписям занятий.
        </p>

        <div style={{ marginTop: '2rem' }}>
          <a
            href="https://t.me/"
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
              transition: 'background 0.3s'
            }}
          >
            Открыть бота в Telegram
          </a>
        </div>
      </main>
    </div>
  );
} 