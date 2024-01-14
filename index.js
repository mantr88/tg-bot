const TgApi = require("node-telegram-bot-api");
const { gameOptions, againOptions } = require("./options");

const token = "6960541088:AAGBObm6Gl-IWAf_VlhSlxHWVG7esx98N1E";

const bot = new TgApi(token, { polling: true });

const chats = {};

const startGame = async (chatId) => {
  await bot.sendMessage(
    chatId,
    "Зараз я звгвдвю цифру від 0 до 9, а ти повинен(на) її відгадати"
  );
  const randomNumber = Math.floor(Math.random() * 10);
  chats[chatId] = randomNumber;

  await bot.sendMessage(chatId, "Вгадуй", gameOptions);
};

bot.setMyCommands([
  { command: "/start", description: "Привітанячко!" },
  { command: "/info", description: "Отримати інформацію про користувача" },
  { command: "/game", description: "Гра вгадай цифру" },
]);

const start = () => {
  bot.on("message", async (msg) => {
    const text = msg.text;
    const chatId = msg.chat.id;

    if (text === "/start") {
      await bot.sendSticker(
        chatId,
        "https://media.stickerswiki.app/ptkdev/1069198.160.webp"
      );
      return bot.sendMessage(
        chatId,
        `Вітаю Вас в Telegram боті Петренко Антона 
`
      );
    }

    if (text === "/info") {
      return bot.sendMessage(
        chatId,
        `Тебе звати ${msg.from.first_name} ${msg.from.last_name}`
      );
    }

    if (text === "/game") {
      return startGame(chatId);
    }

    return bot.sendMessage(
      chatId,
      "Я не зрозумів тебе, спробуй ще раз, або зміни команду!"
    );
  });

  bot.on("callback_query", (msg) => {
    const data = msg.data;

    const chatId = msg.message.chat.id;

    if (data === "/again") {
      return startGame(chatId);
    }

    if (parseFloat(data) === chats[chatId]) {
      return bot.sendMessage(
        chatId,
        `Вітаю, ти вгадав цифру ${chats[chatId]}`,
        againOptions
      );
    } else {
      return bot.sendMessage(
        chatId,
        `Нажаль ти не вгадав, бот загадав цифру ${chats[chatId]}`,
        againOptions
      );
    }
  });
};

start();
