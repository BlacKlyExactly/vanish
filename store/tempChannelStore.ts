import { createStore } from 'zustand/vanilla';
import { type VoiceChannel, type GuildMember } from 'discord.js';

type TempChannel = {
  members: GuildMember[];
  channel: VoiceChannel;
};

type TempChannelStore = {
  channels: TempChannel[];
  createTempChannel: (tempChannel: TempChannel) => any;
  removeTempChannel: (name: string) => any;
};

export const tempChannelStore = createStore<TempChannelStore>((set) => ({
  channels: [],

  createTempChannel: ({ members, channel }) => {
    members.forEach((member) =>
      member.voice.setChannel(channel as VoiceChannel),
    );

    set((state) => ({
      channels: [...state.channels, { members, channel }],
    }));
  },

  removeTempChannel: (name) => {
    set((state) => {
      const channelToRemove = state.channels.find(
        ({ channel }) => channel.name === name,
      );

      channelToRemove?.channel.delete();

      return {
        channels: state.channels.filter(({ channel }) => channel.name !== name),
      };
    });
  },
}));
