const axios = require('axios');

/**
 * Проверяет, является ли строка ссылкой
 * @param {string} text - текст для проверки
 * @returns {boolean} - результат проверки
 */
function isValidUrl(text) {
  try {
    new URL(text);
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Проверяет доступность ссылки
 * @param {string} url - ссылка для проверки
 * @returns {Promise<boolean>} - результат проверки
 */
async function isLinkAccessible(url) {
  try {
    // Проверяем, что это URL
    if (!isValidUrl(url)) {
      return false;
    }
    
    // Проверяем доступность ссылки
    const response = await axios.head(url, { 
      timeout: 5000,
      validateStatus: status => status < 400
    });
    return response.status < 400;
  } catch (error) {
    return false;
  }
}

/**
 * Проверяет, является ли ссылка ссылкой на Google Drive
 * @param {string} url - ссылка для проверки
 * @returns {boolean} - результат проверки
 */
function isGoogleDriveLink(url) {
  try {
    const parsedUrl = new URL(url);
    return (
      parsedUrl.hostname === 'drive.google.com' || 
      parsedUrl.hostname === 'docs.google.com'
    );
  } catch (e) {
    return false;
  }
}

/**
 * Форматирует данные отчета для отправки администратору
 * @param {Object} reportData - данные отчета
 * @returns {string} - форматированный текст
 */
function formatReportForAdmin(reportData) {
  return `
📋 *Новый отчет о занятии*

👨‍🏫 *Преподаватель*: ${reportData.teacherName}
🏙 *Город*: ${reportData.city}
👥 *Возрастная группа*: ${reportData.ageGroup}
🔢 *Номер занятия*: ${reportData.lessonNumber}
🎬 *Видео*: ${reportData.videoLink}

📊 *Оценки*:
- Успешность занятия: ${reportData.lessonSuccess}/5
${reportData.lessonSuccessComment ? `  Комментарий: ${reportData.lessonSuccessComment}` : ''}
- Подготовка: ${reportData.preparation}/5
${reportData.preparationComment ? `  Комментарий: ${reportData.preparationComment}` : ''}
- Заинтересованность: ${reportData.participantsInterest}/5
${reportData.participantsInterestComment ? `  Комментарий: ${reportData.participantsInterestComment}` : ''}
- Достижение целей: ${reportData.goalsAchieved}/5
${reportData.goalsAchievedComment ? `  Комментарий: ${reportData.goalsAchievedComment}` : ''}

💬 *Сложности*: ${reportData.difficulties || 'Не указаны'}

🎯 *Цели для обучения*: ${reportData.learningGoals || 'Не указаны'}

👤 *Отправитель*: ${reportData.username} (ID: ${reportData.telegramId})
⏰ *Время отправки*: ${new Date().toLocaleString('ru-RU')}
`;
}

module.exports = {
  isValidUrl,
  isLinkAccessible,
  isGoogleDriveLink,
  formatReportForAdmin
}; 