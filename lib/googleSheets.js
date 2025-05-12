import { google } from 'googleapis';
import config from './config';

class GoogleSheetsService {
  constructor() {
    this.sheetId = config.GOOGLE_SHEET_ID;
    
    // Проверяем, что private key корректно обрабатывается
    const privateKey = config.GOOGLE_PRIVATE_KEY
      ? config.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n') 
      : '';
    
    // Создаем JWT клиент для авторизации
    this.jwtClient = new google.auth.JWT(
      config.GOOGLE_CLIENT_EMAIL,
      null,
      privateKey,
      ['https://www.googleapis.com/auth/spreadsheets']
    );
    
    // Инициализируем API
    this.sheetsApi = google.sheets({ version: 'v4', auth: this.jwtClient });
  }

  /**
   * Сохраняет данные отчета в Google Таблицу
   * @param {Object} reportData - данные отчета
   * @returns {Promise<Object>} - результат операции
   */
  async saveReport(reportData) {
    try {
      const dateTime = new Date().toISOString();
      
      // Преобразуем данные в формат для вставки в таблицу
      const values = [
        [
          dateTime,
          reportData.telegramId || '',
          reportData.username || '',
          reportData.city || '',
          reportData.teacherName || '',
          reportData.ageGroup || '',
          reportData.lessonNumber || '',
          reportData.videoLink || '',
          reportData.lessonSuccess || '',
          reportData.lessonSuccessComment || '',
          reportData.preparation || '',
          reportData.preparationComment || '',
          reportData.participantsInterest || '',
          reportData.participantsInterestComment || '',
          reportData.goalsAchieved || '',
          reportData.goalsAchievedComment || '',
          reportData.difficulties || '',
          reportData.learningGoals || ''
        ]
      ];

      // Добавляем данные в конец таблицы
      const result = await this.sheetsApi.spreadsheets.values.append({
        spreadsheetId: this.sheetId,
        range: 'Отчеты!A:R', // Диапазон A-R для всех наших данных
        valueInputOption: 'RAW',
        resource: { values }
      });

      return result.data;
    } catch (error) {
      console.error('Ошибка при сохранении в Google Sheets:', error);
      throw error;
    }
  }

  /**
   * Инициализирует таблицу с заголовками, если она пуста
   * @returns {Promise<void>}
   */
  async initializeSheetIfNeeded() {
    try {
      // Проверяем, существуют ли данные в таблице
      const response = await this.sheetsApi.spreadsheets.values.get({
        spreadsheetId: this.sheetId,
        range: 'Отчеты!A1:R1'
      });

      // Если заголовков нет, добавляем их
      if (!response.data.values || response.data.values.length === 0) {
        const headers = [
          [
            'Дата/Время',
            'Telegram ID',
            'Имя пользователя',
            'Город',
            'Имя преподавателя',
            'Возрастная группа',
            'Номер занятия',
            'Ссылка на видео',
            'Успешность занятия (1-5)',
            'Комментарий по успешности',
            'Подготовка (1-5)',
            'Комментарий по подготовке',
            'Заинтересованность (1-5)',
            'Комментарий по заинтересованности',
            'Достижение целей (1-5)',
            'Комментарий по целям',
            'Сложности',
            'Цели обучения'
          ]
        ];

        await this.sheetsApi.spreadsheets.values.update({
          spreadsheetId: this.sheetId,
          range: 'Отчеты!A1:R1',
          valueInputOption: 'RAW',
          resource: { values: headers }
        });
      }
    } catch (error) {
      console.error('Ошибка при инициализации Google Sheets:', error);
      throw error;
    }
  }
}

const googleSheetsService = new GoogleSheetsService();
export default googleSheetsService; 