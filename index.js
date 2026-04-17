const { Client, GatewayIntentBits } = require('discord.js');
const { joinVoiceChannel, getVoiceConnection } = require('@discordjs/voice');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates
  ]
});

// ENV
const TOKEN = process.env.TOKEN;

// server idle
const GUILD_ID = process.env.GUILD_ID;
const VOICE_CHANNEL_ID = process.env.VOICE_CHANNEL_ID;

// server follow
const FOLLOW_GUILD_ID = process.env.FOLLOW_GUILD_ID;
const USER_ID = process.env.USER_ID;

client.on('ready', async () => {
  console.log(`Bot aktif sebagai ${client.user.tag}`);

  // ===== SERVER IDLE =====
  const guild = client.guilds.cache.get(GUILD_ID);
  if (!guild) return console.log('Guild idle tidak ditemukan');

  const channel = guild.channels.cache.get(VOICE_CHANNEL_ID);
  if (!channel) return console.log('Channel idle tidak ditemukan');

  joinVoiceChannel({
    channelId: VOICE_CHANNEL_ID,
    guildId: GUILD_ID,
    adapterCreator: guild.voiceAdapterCreator,
    selfMute: true,
    selfDeaf: true
  });

  console.log('Bot idle di server utama 🎧');
});

// ===== VOICE EVENT =====
client.on('voiceStateUpdate', (oldState, newState) => {

  // =========================
  // 🔁 RECONNECT SERVER IDLE
  // =========================
  if (
    oldState.member.id === client.user.id &&
    oldState.guild.id === GUILD_ID &&
    !newState.channel
  ) {
    console.log('Bot idle keluar, reconnect...');

    setTimeout(() => {
      joinVoiceChannel({
        channelId: VOICE_CHANNEL_ID,
        guildId: GUILD_ID,
        adapterCreator: oldState.guild.voiceAdapterCreator,
        selfMute: true,
        selfDeaf: true
      });
    }, 3000);
  }

  // =========================
  // 🎯 FOLLOW KAMU (SERVER LAIN)
  // =========================
  if (newState.guild.id !== FOLLOW_GUILD_ID) return;
  if (newState.id !== USER_ID) return;

  const guild = newState.guild;

  // kamu masuk / pindah VC
  if (newState.channelId) {
    console.log(`Ngikut kamu ke ${newState.channel.name}`);

    joinVoiceChannel({
      channelId: newState.channelId,
      guildId: guild.id,
      adapterCreator: guild.voiceAdapterCreator,
      selfMute: true,
      selfDeaf: true
    });
  } 
  // kamu keluar VC
  else {
    console.log('Kamu keluar VC, bot juga keluar');

    const connection = getVoiceConnection(guild.id);
    if (connection) connection.destroy();
  }
});

client.login(TOKEN);
