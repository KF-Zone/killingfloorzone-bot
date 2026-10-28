const {
  ChannelType,
  MessageFlags,
  PermissionFlagsBits,
  SlashCommandBuilder,
} = require('discord.js');
const { postToWebApi } = require('../../lib/webApi');

const gameChoices = [
  { name: 'Killing Floor', value: 'kf' },
  { name: 'Killing Floor 2', value: 'kf2' },
  { name: 'Killing Floor 3', value: 'kf3' },
];

function isGuildManager(interaction) {
  return interaction.memberPermissions?.has(PermissionFlagsBits.ManageGuild) ?? false;
}

function parseInviteUrl(value) {
  let url;
  try {
    url = new URL(value);
  }
 catch {
    throw new Error('Enter a valid Discord invitation URL.');
  }

  const invitePath = url.hostname === 'discord.gg'
    ? /^\/[\w-]+\/?$/.test(url.pathname)
    : url.hostname === 'discord.com' && /^\/invite\/[\w-]+\/?$/.test(url.pathname);

  if (
    url.protocol !== 'https:'
    || url.username
    || url.password
    || url.port
    || url.search
    || !invitePath
  ) {
    throw new Error('Use a link from discord.gg or discord.com/invite.');
  }

  return url.origin + url.pathname;
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('community')
    .setDescription('Manage this server in the Killing Floor Zone directory.')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addSubcommand((subcommand) => subcommand
      .setName('setup')
      .setDescription('Register or update this community.')
      .addStringOption((option) => option
        .setName('name')
        .setDescription('Community name shown on Killing Floor Zone.')
        .setMaxLength(100)
        .setRequired(true))
      .addStringOption((option) => option
        .setName('game')
        .setDescription('Killing Floor game for this community.')
        .addChoices(...gameChoices)
        .setRequired(true))
      .addStringOption((option) => option
        .setName('language')
        .setDescription('Primary language code, for example en or es.')
        .setMaxLength(16)
        .setRequired(true))
      .addStringOption((option) => option
        .setName('description')
        .setDescription('Short public description.')
        .setMaxLength(500)
        .setRequired(false)))
    .addSubcommand((subcommand) => subcommand
      .setName('invite-url')
      .setDescription('Set an existing Discord invitation URL.')
      .addStringOption((option) => option
        .setName('url')
        .setDescription('A discord.gg or discord.com/invite link.')
        .setRequired(true)))
    .addSubcommand((subcommand) => subcommand
      .setName('invite-create')
      .setDescription('Create an invitation for a channel and publish it.')
      .addChannelOption((option) => option
        .setName('channel')
        .setDescription('Channel where the bot can create an invitation.')
        .addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement, ChannelType.GuildVoice)
        .setRequired(true)))
    .addSubcommand((subcommand) => subcommand
      .setName('remove')
      .setDescription('Remove this server from the public directory.')),

  async execute(interaction) {
    if (!interaction.inGuild()) {
      return interaction.reply({
        content: 'Community management is only available inside a Discord server.',
        flags: MessageFlags.Ephemeral,
      });
    }

    if (!isGuildManager(interaction)) {
      return interaction.reply({
        content: 'You need the Manage Server permission to change this listing.',
        flags: MessageFlags.Ephemeral,
      });
    }

    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    const subcommand = interaction.options.getSubcommand();
    if (subcommand === 'setup') {
      await postToWebApi('community/setup', {
        guildId: interaction.guildId,
        userId: interaction.user.id,
        name: interaction.options.getString('name', true).trim(),
        description: interaction.options.getString('description')?.trim() || '',
        game: interaction.options.getString('game', true),
        language: interaction.options.getString('language', true).trim(),
      });

      return interaction.editReply({
        content: 'Community details saved. Set an invite with `/community invite-url` or create one with `/community invite-create` to publish the listing.',
        flags: MessageFlags.Ephemeral,
      });
    }

    if (subcommand === 'invite-url') {
      const inviteUrl = parseInviteUrl(interaction.options.getString('url', true).trim());
      await postToWebApi('community/invite', { guildId: interaction.guildId, inviteUrl });
      return interaction.editReply({
        content: 'Invitation saved and the community listing is now published.',
        flags: MessageFlags.Ephemeral,
      });
    }

    if (subcommand === 'invite-create') {
      const channel = interaction.options.getChannel('channel', true);
      if (channel.guildId !== interaction.guildId) {
        throw new Error('Choose a channel from this server.');
      }

      const botPermissions = channel.permissionsFor(interaction.client.user);
      if (!botPermissions?.has(PermissionFlagsBits.CreateInstantInvite)) {
        throw new Error('Give the bot Create Invite permission in the selected channel.');
      }

      const invite = await channel.createInvite({
        maxAge: 0,
        maxUses: 0,
        unique: false,
        reason: `Community directory invite configured by ${interaction.user.id}`,
      });
      const inviteUrl = parseInviteUrl(invite.url);
      await postToWebApi('community/invite', { guildId: interaction.guildId, inviteUrl });

      return interaction.editReply({
        content: `Invitation created and saved: ${inviteUrl}`,
        flags: MessageFlags.Ephemeral,
        allowedMentions: { parse: [] },
      });
    }

    if (subcommand === 'remove') {
      await postToWebApi('community/remove', { guildId: interaction.guildId });

      return interaction.editReply({
        content: 'This server has been removed from the public directory.',
        flags: MessageFlags.Ephemeral,
      });
    }

    throw new Error('This community command is not supported.');
  },
};
