const TgApi = require('node-telegram-bot-api');
const { gameOptions, againOptions } = require('./options');
const sequilize = require('./db');
const UserModel = require('./models');
const dotenv = require('dotenv/config');
const TOKEN = process.env.TOKEN;
const PORT = process.env.PORT || 3000;

const express = require('express');
const app = express();

app.get('/', (req, res) => res.status(200));
app.listen(PORT, () => console.log(`Example app listening on port ${PORT}!`));

const bot = new TgApi(TOKEN, { polling: true });

const chats = {};

const startGame = async chatId => {
  await bot.sendMessage(chatId, 'Зараз я загадаю цифру від 0 до 9, а ти повинен(на) її відгадати');
  const randomNumber = Math.floor(Math.random() * 10);
  chats[chatId] = randomNumber;

  await bot.sendMessage(chatId, 'Вгадуй', gameOptions);
};

bot.setMyCommands([
  { command: '/start', description: 'Привітанячко!' },
  { command: '/info', description: 'Отримати інформацію про користувача' },
  { command: '/game', description: 'Гра вгадай цифру' },
]);

const start = async () => {
  try {
    await sequilize.authenticate();
    await sequilize.sync();
  } catch (error) {
    console.log(error);
  }

  bot.on('message', async msg => {
    const text = msg.text;
    const chatId = msg.chat.id;

    try {
      if (text === '/start') {
        const user = await UserModel.findOne({ chatId });
        if (!user) {
          await UserModel.create({ chatId });
        }

        await bot.sendSticker(chatId, 'https://media.stickerswiki.app/ptkdev/1069198.160.webp');
        return bot.sendMessage(chatId, 'Вітаю Вас в Telegram боті Петренко Антона!');
      }

      if (text === '/info') {
        const user = await UserModel.findOne({ chatId });
        return bot.sendMessage(
          chatId,
          `Вітаю тебе ${msg.from.first_name}, в тебе правильних відповідей у грі ${user.correct}, неправильних відповідей ${user.wrong}`,
        );
      }

      if (text === '/game') {
        return startGame(chatId);
      }

      return bot.sendMessage(chatId, 'Я не зрозумів тебе, спробуй ще раз, або зміни команду!');
    } catch (error) {
      return bot.sendMessage(chatId, 'Виникла якась помилка, давай почнемо спочатку!');
    }
  });

  bot.on('callback_query', async msg => {
    const data = msg.data;

    const chatId = msg.message.chat.id;

    try {
      if (data === '/again') {
        return startGame(chatId);
      }
      const user = await UserModel.findOne({ chatId });

      if (parseFloat(data) === chats[chatId]) {
        user.correct += 1;
        await bot.sendMessage(chatId, `Вітаю, ти вгадав цифру ${chats[chatId]}`, againOptions);
      } else {
        user.wrong += 1;
        await bot.sendMessage(
          chatId,
          `Нажаль ти не вгадав, бот загадав цифру ${chats[chatId]}`,
          againOptions,
        );
      }

      await user.save();
    } catch (error) {
      return bot.sendMessage(chatId, 'Виникла якась помилка, давай почнемо спочатку!');
    }
  });
};

start();
