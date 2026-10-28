const { MessageFlags, SlashCommandBuilder } = require('discord.js');
const { postToWebApi } = require('../../lib/webApi');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('link-steam')
    .setDescription('Verify and link your Steam account privately.'),

  async execute(interaction) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    try {
      const { linkUrl } = await postToWebApi('steam/link', { discordUserId: interaction.user.id });
      await interaction.editReply({
        content: `Open this one-use link to verify Steam. It expires in 10 minutes: ${linkUrl}`,
        allowedMentions: { parse: [] },
      });
    }
 catch (error) {
      await interaction.editReply({
        content: error.message || 'Could not start Steam account linking.',
      });
    }
  },
};
