module.exports = {
  // Telegram Bot Token
  TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN,
  
  // Google Sheets API
  GOOGLE_SHEET_ID: process.env.GOOGLE_SHEET_ID,
  GOOGLE_CLIENT_EMAIL: process.env.GOOGLE_CLIENT_EMAIL,
  GOOGLE_PRIVATE_KEY: process.env.GOOGLE_PRIVATE_KEY,
  
  // Admin Telegram ID
  ADMIN_TELEGRAM_ID: process.env.ADMIN_TELEGRAM_ID,
  
  // Vercel URL
  VERCEL_URL: process.env.VERCEL_URL || 'http://localhost:3000'
}; 