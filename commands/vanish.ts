import {
  ChannelType,
  GuildMember,
  Interaction,
  OverwriteResolvable,
  SlashCommandBuilder,
  VoiceChannel,
} from 'discord.js';
import { uuid } from 'uuidv4';

import { tempChannelStore } from '../store/tempChannelStore';

const vanish = {
  command: new SlashCommandBuilder()
    .setName('vanish')
    .setDescription('Vanish')
    .addMentionableOption((option) =>
      option.setName('user').setRequired(false).setDescription('Vanish user'),
    ),
  action: async (interaction: Interaction) => {
    if (!interaction.isChatInputCommand()) return;

    const user = interaction.options.get('user')?.user;
    const guild = interaction.guild;

    if (!guild) return;

    const member = user && guild?.members.cache.get(user?.id);
    const author = guild?.members.cache.get(interaction.user.id);

    if (!author) return;

    if (!author.permissions.has('Administrator')) {
      interaction.reply(
        'Musisz mieć administratora, aby utworzyć kanał tymczasowy.',
      );

      return;
    }

    if ((member && !member.voice.channel) || !author.voice.channel) {
      interaction.reply(
        'Ty lub wybrany użytkownik nie jesteście na kanale głosowym.',
      );

      return;
    }

    const everyoneRole = guild.roles.cache.find(
      (role) => role.name === '@everyone',
    );

    if (!everyoneRole) return;

    const tempMembers = [member, author].filter(
      (value) => value?.id !== undefined,
    ) as GuildMember[];

    const permissionsOverwrites: OverwriteResolvable[] = tempMembers.map(
      (member) => ({
        id: member.id,
        allow: ['Connect'],
        deny: ['ViewChannel'],
      }),
    );

    const channelName = `temp-${uuid()}`;

    const channel = (await guild.channels.create({
      name: channelName,
      type: ChannelType.GuildVoice,
      permissionOverwrites: [
        {
          id: everyoneRole?.id,
          deny: ['ViewChannel', 'Connect'],
        },
        ...permissionsOverwrites,
      ],
    })) as VoiceChannel;

    if (!channel) return;

    tempChannelStore.getState().createTempChannel({
      channel,
      members: tempMembers,
    });

    interaction.reply(`Utworzono kanał tymczasowy: ${channelName}`);
  },
};

export default vanish;
