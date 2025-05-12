import { Telegraf, Scenes, session, Markup } from 'telegraf';
import { message } from 'telegraf/filters';
import config from './config';
import messages from '../constants/messages';
import googleSheets from './googleSheets';
import { isValidUrl, isLinkAccessible, formatReportForAdmin } from './utils';

// Создаем экземпляр бота
const bot = new Telegraf(config.TELEGRAM_BOT_TOKEN);

// Сцена для сбора информации о городе
const cityScene = new Scenes.BaseScene('city');
cityScene.enter(async (ctx) => {
  await ctx.reply(
    messages.CITY_PROMPT, 
    Markup.inlineKeyboard(
      messages.CITIES.map(city => [Markup.button.callback(city, `city_${city}`)])
    )
  );
});

cityScene.action(/city_(.+)/, async (ctx) => {
  ctx.scene.state.city = ctx.match[1];
  await ctx.answerCbQuery();
  return ctx.scene.enter('teacherName');
});

// Сцена для сбора имени преподавателя
const teacherNameScene = new Scenes.BaseScene('teacherName');
teacherNameScene.enter(async (ctx) => {
  await ctx.reply(messages.TEACHER_NAME_PROMPT);
});

teacherNameScene.on(message('text'), async (ctx) => {
  ctx.scene.state.teacherName = ctx.message.text;
  return ctx.scene.enter('ageGroup');
});

// Сцена для выбора возрастной группы
const ageGroupScene = new Scenes.BaseScene('ageGroup');
ageGroupScene.enter(async (ctx) => {
  await ctx.reply(
    messages.AGE_GROUP_PROMPT,
    Markup.inlineKeyboard([
      [Markup.button.callback(messages.AGE_GROUP_PRESCHOOL, 'age_preschool')],
      [Markup.button.callback(messages.AGE_GROUP_KIDS, 'age_kids')],
      [Markup.button.callback(messages.AGE_GROUP_JUNIOR, 'age_junior')]
    ])
  );
});

ageGroupScene.action(/age_(.+)/, async (ctx) => {
  const ageGroupMap = {
    preschool: messages.AGE_GROUP_PRESCHOOL,
    kids: messages.AGE_GROUP_KIDS,
    junior: messages.AGE_GROUP_JUNIOR
  };
  
  ctx.scene.state.ageGroup = ageGroupMap[ctx.match[1]];
  await ctx.answerCbQuery();
  return ctx.scene.enter('lessonNumber');
});

// Сцена для номера занятия
const lessonNumberScene = new Scenes.BaseScene('lessonNumber');
lessonNumberScene.enter(async (ctx) => {
  await ctx.reply(messages.LESSON_NUMBER_PROMPT);
});

lessonNumberScene.on(message('text'), async (ctx) => {
  const number = parseInt(ctx.message.text, 10);
  if (isNaN(number)) {
    return ctx.reply(messages.INVALID_LESSON_NUMBER);
  }
  
  ctx.scene.state.lessonNumber = number;
  return ctx.scene.enter('video');
});

// Сцена для получения видео
const videoScene = new Scenes.BaseScene('video');
videoScene.enter(async (ctx) => {
  await ctx.reply(messages.VIDEO_PROMPT);
});

videoScene.on(message('text'), async (ctx) => {
  const link = ctx.message.text;
  
  // Проверяем ссылку на видео
  if (isValidUrl(link)) {
    const isAccessible = await isLinkAccessible(link);
    if (!isAccessible) {
      return ctx.reply(messages.INVALID_LINK);
    }
    
    ctx.scene.state.videoLink = link;
    return ctx.scene.enter('lessonSuccess');
  } else {
    return ctx.reply(messages.INVALID_LINK);
  }
});

videoScene.on(message('video'), async (ctx) => {
  const fileId = ctx.message.video.file_id;
  const fileUrl = `tg://file?id=${fileId}`;
  
  ctx.scene.state.videoLink = fileUrl;
  return ctx.scene.enter('lessonSuccess');
});

// Сцена для оценки успешности занятия
const lessonSuccessScene = new Scenes.BaseScene('lessonSuccess');
lessonSuccessScene.enter(async (ctx) => {
  await ctx.reply(
    messages.LESSON_SUCCESS_PROMPT,
    Markup.inlineKeyboard(
      messages.RATINGS.map(rate => [Markup.button.callback(rate, `rate_${rate}`)])
    )
  );
});

lessonSuccessScene.action(/rate_(.+)/, async (ctx) => {
  const rating = ctx.match[1];
  ctx.scene.state.lessonSuccess = rating;
  await ctx.answerCbQuery();
  
  // Если оценка < 4, запрашиваем комментарий
  if (parseInt(rating, 10) < 4) {
    await ctx.reply(messages.LESSON_SUCCESS_FOLLOWUP);
    return ctx.wizard.next();
  } else {
    return ctx.scene.enter('preparation');
  }
});

lessonSuccessScene.on(message('text'), async (ctx) => {
  const comment = ctx.message.text;
  
  // Проверяем длину комментария
  if (comment.length < 30) {
    return ctx.reply(messages.INVALID_ANSWER);
  }
  
  ctx.scene.state.lessonSuccessComment = comment;
  return ctx.scene.enter('preparation');
});

// Сцена для оценки подготовки к занятию
const preparationScene = new Scenes.BaseScene('preparation');
preparationScene.enter(async (ctx) => {
  await ctx.reply(
    messages.LESSON_PREPARATION_PROMPT,
    Markup.inlineKeyboard(
      messages.RATINGS.map(rate => [Markup.button.callback(rate, `rate_${rate}`)])
    )
  );
});

preparationScene.action(/rate_(.+)/, async (ctx) => {
  const rating = ctx.match[1];
  ctx.scene.state.preparation = rating;
  await ctx.answerCbQuery();
  
  // Если оценка < 5, запрашиваем комментарий
  if (parseInt(rating, 10) < 5) {
    await ctx.reply(messages.LESSON_PREPARATION_FOLLOWUP);
    return ctx.wizard.next();
  } else {
    return ctx.scene.enter('participantsInterest');
  }
});

preparationScene.on(message('text'), async (ctx) => {
  const comment = ctx.message.text;
  
  // Проверяем длину комментария
  if (comment.length < 30) {
    return ctx.reply(messages.INVALID_ANSWER);
  }
  
  ctx.scene.state.preparationComment = comment;
  return ctx.scene.enter('participantsInterest');
});

// Сцена для оценки заинтересованности участников
const participantsInterestScene = new Scenes.BaseScene('participantsInterest');
participantsInterestScene.enter(async (ctx) => {
  await ctx.reply(
    messages.PARTICIPANTS_INTEREST_PROMPT,
    Markup.inlineKeyboard(
      messages.RATINGS.map(rate => [Markup.button.callback(rate, `rate_${rate}`)])
    )
  );
});

participantsInterestScene.action(/rate_(.+)/, async (ctx) => {
  const rating = ctx.match[1];
  ctx.scene.state.participantsInterest = rating;
  await ctx.answerCbQuery();
  
  // Если оценка < 4, запрашиваем комментарий
  if (parseInt(rating, 10) < 4) {
    await ctx.reply(messages.PARTICIPANTS_INTEREST_FOLLOWUP);
    return ctx.wizard.next();
  } else {
    return ctx.scene.enter('goalsAchieved');
  }
});

participantsInterestScene.on(message('text'), async (ctx) => {
  const comment = ctx.message.text;
  
  // Проверяем длину комментария
  if (comment.length < 30) {
    return ctx.reply(messages.INVALID_ANSWER);
  }
  
  ctx.scene.state.participantsInterestComment = comment;
  return ctx.scene.enter('goalsAchieved');
});

// Сцена для оценки достижения целей занятия
const goalsAchievedScene = new Scenes.BaseScene('goalsAchieved');
goalsAchievedScene.enter(async (ctx) => {
  await ctx.reply(
    messages.GOALS_ACHIEVED_PROMPT,
    Markup.inlineKeyboard(
      messages.RATINGS.map(rate => [Markup.button.callback(rate, `rate_${rate}`)])
    )
  );
});

goalsAchievedScene.action(/rate_(.+)/, async (ctx) => {
  const rating = ctx.match[1];
  ctx.scene.state.goalsAchieved = rating;
  await ctx.answerCbQuery();
  
  // Если оценка < 4, запрашиваем комментарий
  if (parseInt(rating, 10) < 4) {
    await ctx.reply(messages.GOALS_ACHIEVED_FOLLOWUP);
    return ctx.wizard.next();
  } else {
    return ctx.scene.enter('difficulties');
  }
});

goalsAchievedScene.on(message('text'), async (ctx) => {
  const comment = ctx.message.text;
  
  // Проверяем длину комментария
  if (comment.length < 30) {
    return ctx.reply(messages.INVALID_ANSWER);
  }
  
  ctx.scene.state.goalsAchievedComment = comment;
  return ctx.scene.enter('difficulties');
});

// Сцена для сложностей при проведении занятия
const difficultiesScene = new Scenes.BaseScene('difficulties');
difficultiesScene.enter(async (ctx) => {
  await ctx.reply(messages.DIFFICULTIES_PROMPT);
});

difficultiesScene.on(message('text'), async (ctx) => {
  ctx.scene.state.difficulties = ctx.message.text;
  return ctx.scene.enter('learningGoals');
});

// Учитываем, что пользователь может не ответить на этот вопрос
difficultiesScene.on(message, async (ctx) => {
  ctx.scene.state.difficulties = '';
  return ctx.scene.enter('learningGoals');
});

// Сцена для целей обучения
const learningGoalsScene = new Scenes.BaseScene('learningGoals');
learningGoalsScene.enter(async (ctx) => {
  await ctx.reply(messages.LEARNING_GOALS_PROMPT);
});

learningGoalsScene.on(message('text'), async (ctx) => {
  ctx.scene.state.learningGoals = ctx.message.text;
  return ctx.scene.enter('finish');
});

// Учитываем, что пользователь может не ответить на этот вопрос
learningGoalsScene.on(message, async (ctx) => {
  ctx.scene.state.learningGoals = '';
  return ctx.scene.enter('finish');
});

// Финальная сцена - сохранение данных
const finishScene = new Scenes.BaseScene('finish');
finishScene.enter(async (ctx) => {
  try {
    // Получаем все данные из состояния сцены
    const reportData = {
      telegramId: ctx.from.id,
      username: ctx.from.username || `${ctx.from.first_name} ${ctx.from.last_name || ''}`,
      ...ctx.scene.state
    };
    
    // Сохраняем в Google Sheets
    await googleSheets.saveReport(reportData);
    
    // Отправляем подтверждение пользователю
    await ctx.reply(messages.REPORT_SENT);
    
    // Отправляем отчет администратору
    if (config.ADMIN_TELEGRAM_ID) {
      try {
        await bot.telegram.sendMessage(
          config.ADMIN_TELEGRAM_ID,
          formatReportForAdmin(reportData),
          { parse_mode: 'Markdown' }
        );
      } catch (error) {
        console.error('Ошибка при отправке отчета администратору:', error);
      }
    }
    
    // Возвращаемся в главное меню
    await showMainMenu(ctx);
    return ctx.scene.leave();
  } catch (error) {
    console.error('Ошибка при сохранении отчета:', error);
    await ctx.reply('Произошла ошибка при сохранении отчета. Пожалуйста, попробуйте позже.');
    return ctx.scene.leave();
  }
});

// Создаем менеджер сцен
const stage = new Scenes.Stage([
  cityScene,
  teacherNameScene,
  ageGroupScene,
  lessonNumberScene,
  videoScene,
  lessonSuccessScene,
  preparationScene,
  participantsInterestScene,
  goalsAchievedScene,
  difficultiesScene,
  learningGoalsScene,
  finishScene
]);

// Функция для показа главного меню
async function showMainMenu(ctx) {
  return ctx.reply(
    messages.WELCOME_MESSAGE,
    Markup.inlineKeyboard([
      [Markup.button.callback(messages.SUBMIT_VIDEO_BUTTON, 'submit_video')],
      [Markup.button.callback(messages.HELP_BUTTON, 'help')]
    ])
  );
}

// Настраиваем middleware
bot.use(session());
bot.use(stage.middleware());

// Обработчик команды /start
bot.command('start', async (ctx) => {
  console.log('Получена команда /start от пользователя', ctx.from.id);
  try {
    await showMainMenu(ctx);
    console.log('Главное меню успешно отображено пользователю', ctx.from.id);
  } catch (error) {
    console.error('Ошибка при обработке команды /start:', error);
    // Пробуем отправить простое сообщение без форматирования и кнопок
    try {
      await ctx.reply('Добро пожаловать! Произошла ошибка при отображении меню. Попробуйте позже или свяжитесь с администратором.');
    } catch (replyError) {
      console.error('Критическая ошибка, не удалось отправить сообщение:', replyError);
    }
  }
});

// Обработчик кнопки "Сдать видео"
bot.action('submit_video', async (ctx) => {
  await ctx.answerCbQuery();
  return ctx.scene.enter('city');
});

// Обработчик кнопки "Справка"
bot.action('help', async (ctx) => {
  await ctx.answerCbQuery();
  await ctx.reply(messages.HELP_TEXT);
  return showMainMenu(ctx);
});

// Обработчик текстовых сообщений, не входящих в сцены
bot.on(message('text'), async (ctx) => {
  console.log('Получено текстовое сообщение вне сцены:', ctx.message.text);
  
  // Проверяем, не находится ли пользователь в сцене
  if (ctx.scene && ctx.scene.current) {
    console.log('Пользователь находится в сцене, пропускаем обработку');
    return;
  }
  
  // Команды могут приходить и в виде обычных сообщений
  if (ctx.message.text.startsWith('/start')) {
    console.log('Получена команда /start в виде текста');
    try {
      await showMainMenu(ctx);
    } catch (error) {
      console.error('Ошибка при обработке /start через текст:', error);
    }
    return;
  }
  
  if (ctx.message.text.startsWith('/help')) {
    console.log('Получена команда /help в виде текста');
    try {
      await ctx.reply(messages.HELP_TEXT);
      await showMainMenu(ctx);
    } catch (error) {
      console.error('Ошибка при обработке /help через текст:', error);
    }
    return;
  }
  
  // Для всех других сообщений показываем подсказку
  try {
    await ctx.reply('Пожалуйста, используйте кнопки меню или команду /start для начала работы.');
    await showMainMenu(ctx);
  } catch (error) {
    console.error('Ошибка при обработке текстового сообщения:', error);
  }
});

// Инициализация Google Sheets при запуске бота
async function initializeServices() {
  try {
    await googleSheets.initializeSheetIfNeeded();
    console.log('Google Sheets инициализирован успешно');
  } catch (error) {
    console.error('Ошибка при инициализации Google Sheets:', error);
  }
}

// Запуск бота
function startBot() {
  try {
    console.log('Начинаем инициализацию...');
    
    // Добавляем обработчик ошибок
    bot.catch((err, ctx) => {
      console.error(`Ошибка для ${ctx.updateType}`, err);
      // Пытаемся уведомить пользователя
      try {
        ctx.reply('Произошла ошибка при обработке вашего запроса. Пожалуйста, попробуйте снова позже.');
      } catch (replyError) {
        console.error('Не удалось отправить сообщение об ошибке пользователю:', replyError);
      }
    });
    
    // Инициализируем Google Sheets
    initializeServices()
      .then(() => {
        console.log('Сервисы инициализированы успешно');
      })
      .catch(error => {
        console.error('Ошибка при инициализации сервисов:', error);
      });
    
    // Настраиваем опции запуска в зависимости от окружения
    let launchOptions = {};
    
    // В production используем webhook
    if (process.env.NODE_ENV === 'production') {
      console.log('Запуск в режиме production с webhook');
      
      // Не указываем опции webhook здесь, так как они настраиваются через отдельный API эндпоинт
      launchOptions = {
        // Отключаем webhook в launch для предотвращения проблем
        webhook: false
      };
    } else {
      console.log('Запуск в режиме разработки с long polling');
      // Для разработки используем long polling
      launchOptions = {
        polling: true
      };
    }
    
    // Запускаем бота с соответствующими опциями
    bot.launch(launchOptions)
      .then(() => {
        console.log('Telegram бот запущен успешно');
        
        // Отправляем уведомление администратору
        if (config.ADMIN_TELEGRAM_ID) {
          bot.telegram.sendMessage(
            config.ADMIN_TELEGRAM_ID,
            `Бот перезапущен ${new Date().toLocaleString('ru-RU')}`
          ).catch(err => {
            console.error('Не удалось отправить уведомление администратору:', err);
          });
        }
      })
      .catch(error => {
        console.error('Ошибка при запуске бота:', error);
      });
  } catch (error) {
    console.error('Критическая ошибка при запуске бота:', error);
  }
}

// Обработка остановки бота
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

export { bot, startBot }; 