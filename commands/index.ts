import { type Client, type Guild, Events } from 'discord.js';

import vanish from './vanish';

const commands = [vanish];

export const setupCommands = (guild: Guild) => {
  commands.forEach(({ command }) => {
    guild.commands.create(command);
  });
};

export const listenCommands = (client: Client) => {
  client.on(Events.InteractionCreate, (interaction) => {
    if (!interaction.isCommand()) return;

    commands.forEach(({ command, action }) => {
      if (interaction.commandName === command.name) action(interaction);
    });
  });
};
