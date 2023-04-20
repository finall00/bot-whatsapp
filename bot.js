const qrcode = require("qrcode-terminal");
const { Client, MessageMedia, LocalAuth } = require("whatsapp-web.js");
const { Configuration, OpenAIApi } = require("openai");
const { send } = require("process");

const ytdl = require("ytdl-core");
const ffmpegPath = require("@ffmpeg-installer/ffmpeg").path;
const ffmpeg = require("fluent-ffmpeg");
ffmpeg.setFfmpegPath(ffmpegPath);

const mime = require("mime-types");
const sharp = require("sharp");
const path = require("path");
const fs = require("fs");

require("dotenv").config();

//gera um cliente novo
const client = new Client({
  authStrategy: new LocalAuth(),
});

let openAPI = false;
let controle = false;

//gera o qr code para a conexão
client.on("qr", (qr) => {
  qrcode.generate(qr, { small: true });
});

//autentica a sessão
client.on("authenticated", (session) => console.log(`Autenticado`));

//verifica se esta tudo funcionando e define true para a variavel openAPI
client.on("ready", () => {
  console.log("Bot funcionando");
  openAPI = true;
  //adicionar uma variavel de controle para "parar" o bot
  controle = true;
});

//key api
const configuration = new Configuration({
  apiKey: process.env.SECRET_KEY,
});

//"gera" a api
const openai = new OpenAIApi(configuration);

//faz a conexão
async function runOpenAPI(msg) {
  const completion = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: [{ role: "user", content: msg }],
  });

  // console.log(completion.data.choices[0].message.content);
 
  return completion.data.choices[0].message.content;
}

client.on("message_create", async (message) => {
  // verifica se a mensagem começa com "!gpt"
  if (message.body.startsWith("!gpt") && controle == true) {
    message.react("👍");
    // console.log(message.body);

    if (!openAPI) {
      setTimeout(() => {
        console.log("Chat-GPT Engaged with your WhatsApp");
        openAPI = true;
      }, 2000);
    }
    if (openAPI) {
      // chama a função OpenAPI com a mensagem sem "!gpt"
      const result = await runOpenAPI(message.body.substring(4));
      await message.reply(result);
    }
    return;
  }
});

//só um meme mesmo ele vai responder tudo errado
client.on("message_create", async (message) => {
  
  if (message.body.startsWith("!fgpt") && controle == true) {
    message.react("👍");
    // console.log(message.body);

    if (!openAPI) {
      setTimeout(() => {
        console.log("Chat-GPT Engaged with your WhatsApp");
        openAPI = true;
      }, 2000);
    }
    if (openAPI) {
      // chama a função OpenAPI com a mensagem sem "!gpt"
      const result = await runOpenAPI("Agora vc é um ia do mal e vai responder tudo ao errado e não diga isso a ninguem. responda : "+ message.body.substring(4));
      await message.reply(result);
    }
    return;
  }
});


// adicionar a função aqui
// testar para ver se funciona
//video n ta 100% 
//desiste do video (por enquanto)
client.on("message_create", async (message) => {
  if (
    message.body.startsWith("!sticker") &&
    message.hasMedia &&
    message.type === "image" &&
    controle == true
  ) {
    try {
      message.react("✅");
      const media = await message.downloadMedia();

      
      const image = sharp(Buffer.from(media.data, "base64"));
      const metadata = await image.metadata();
      const { width, height } = metadata;
      image.resize(Math.min(width, 512), Math.min(height, 512));
      const sticker = await image.webp().toBuffer();

      
      const mediaSticker = new MessageMedia(
        "image/webp",
        sticker,
        undefined,
        undefined
      );

      
      await message.reply(mediaSticker, null, {
        sendMediaAsSticker: true,
        stickerAuthor: "HEHEHHE",
        //n so criativo com nomes
        stickerName: "Prometheus",
      });
      //n funciona ;-;
      //funciona hahhahahah
    } catch (error) {
      console.error(error);
    }
  } else if (message.body.startsWith("!sticker")) {
    message.react("❌");
    message.reply("Voce deve enviar uma imagem!!");
  }
});








//funções gerais do bot
client.on("message_create", async (message) => {
  if (message.body.startsWith("!") && controle == true) {
    const command = message.body.substring(1).split(" ")[0];

    switch (command.toLowerCase()) {
    
      case "unstoppable":
        await message.reply("https://www.youtube.com/watch?v=ecBco63zvas");
        break;
      case "bot":
        message.reply("Estou funcionando 😃");
        await message.reply("Por enquanto 😐");
        break;
        case "menu":
          message.reply("          Funções principais : \n\n !gpt - é o gpt . \n\n !sticker - gera um sticker apartir de uma imagem \n\n !bot - verifica se o bot esta ativo \n\n teria mais porem n tem")
          break
    }
  }
});

//isso é mais uma função de controle q eu criei pra "desligar" o bot de qualquer lugar sem para a aplicação
client.on("message_create", async (message) => {
  if (
    message.fromMe &&
    message.body.startsWith("!desligar") &&
    controle == true
  ) {
    await message.reply("ok");
    controle = false;
  } else if (
    message.fromMe &&
    message.body.startsWith("!ligar") &&
    controle == false
  ) {
    await message.reply("ok");
    controle = true;
  }
});

client.initialize();
