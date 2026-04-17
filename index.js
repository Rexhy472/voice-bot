const { Client, GatewayIntentBits } = require('discord.js');
const { joinVoiceChannel } = require('@discordjs/voice');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates
  ]
});

// ambil dari Railway ENV
const TOKEN = process.env.TOKEN;
const GUILD_ID = process.env.GUILD_ID;
const VOICE_CHANNEL_ID = process.env.VOICE_CHANNEL_ID;

client.on('ready', async () => {
  console.log(`Bot aktif sebagai ${client.user.tag}`);

  const guild = client.guilds.cache.get(GUILD_ID);
  if (!guild) return console.log('Guild tidak ditemukan');

  const channel = guild.channels.cache.get(VOICE_CHANNEL_ID);
  if (!channel) return console.log('Channel tidak ditemukan');

  joinVoiceChannel({
    channelId: VOICE_CHANNEL_ID,
    guildId: GUILD_ID,
    adapterCreator: guild.voiceAdapterCreator,
    selfMute: true,
    selfDeaf: true
  });

  console.log('Bot masuk voice & idle 🎧');
});

// auto reconnect kalau keluar
client.on('voiceStateUpdate', (oldState, newState) => {
  if (oldState.member.id === client.user.id && !newState.channel) {
    console.log('Bot keluar, reconnect...');

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
});

client.login(TOKEN);
