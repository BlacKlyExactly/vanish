import { Client, Events, GatewayIntentBits } from 'discord.js';
import * as dotenv from 'dotenv';

import { listenCommands, setupCommands } from './commands';
import { tempChannelStore } from './store/tempChannelStore';

dotenv.config();

const client = new Client({
  intents: [
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
  ],
});

client.on(Events.ClientReady, () => {
  console.log('[Vanish] Ready!');
  client.guilds.cache.forEach(setupCommands);
});

client.on(Events.GuildCreate, setupCommands);

client.on(Events.VoiceStateUpdate, () => {
  tempChannelStore.getState().channels.forEach(({ channel }) => {
    if (channel.members.size === 0)
      tempChannelStore.getState().removeTempChannel(channel.name);
  });
});

listenCommands(client);

client.login(process.env.TOKEN);
